import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { getCheckinsBetween } from "@/app/lib/api/getCheckinsBetween";
import { postToFarcaster } from "@/app/lib/external/farcaster";
import { getAirdropWindow } from "@/app/lib/utils/airdropWindow";
import { createBaseProvider } from "@/app/lib/ethersProviders";
import {
  Contract,
  formatUnits,
  isError,
  parseUnits,
  Transaction,
  Wallet,
} from "ethers";
import { NextRequest } from "next/server";
import { getAddress, isAddress } from "viem";

export const dynamic = "force-dynamic";
// Each transfer costs several RPC round trips and they are sent one after the
// other, so a busy day needs well over the default function budget. Cutting the
// loop short silently skips the remaining recipients.
export const maxDuration = 300;

const DAILY_AIRDROP_AMOUNT = 200;
const DAILY_AIRDROP_WEI = parseUnits(DAILY_AIRDROP_AMOUNT.toString(), 18);
const RPC_TIMEOUT_MS = 20_000;
const CONFIRMATION_TIMEOUT_MS = 90_000;

// Sent back to back, only ~4 transfers per burst were accepted and every later
// one was rejected until a block (2 s on Base) had included the queue, which
// left most of each day's recipients unpaid. Pace the sends and retry
// rejections with a growing pause, long enough for the queue to drain.
const PACE_MS = 1_000;
const RETRY_DELAYS_MS = [2_000, 5_000, 15_000];
// Stop starting new transfers in time to confirm the last one inside
// `maxDuration`. Anything unsent is reported and left to scripts/backfill-airdrop.ts.
const SEND_DEADLINE_MS = 180_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A failure the chain itself reported: retrying cannot change the outcome. */
const isRevert = (error: unknown) =>
  isError(error, "CALL_EXCEPTION") || isError(error, "INSUFFICIENT_FUNDS");

/** Another transaction from this wallet (e.g. the mention webhook) took the nonce. */
const isNonceTaken = (error: unknown) =>
  isError(error, "NONCE_EXPIRED") || isError(error, "REPLACEMENT_UNDERPRICED");

/**
 * Send one share and return the hash and nonce it went out under.
 *
 * The transfer is signed once and the same bytes are rebroadcast on every
 * retry, so a retry can never pay a wallet twice: a copy that already reached
 * the mempool is rejected as known instead of executing again. It is re-signed
 * only when a different transaction has taken its nonce.
 */
async function sendShare(
  signer: Wallet,
  contract: Contract,
  to: string,
  amountWei: bigint,
  startNonce: number,
): Promise<{ hash: string; nonce: number }> {
  const provider = signer.provider!;
  const call = await contract.transfer.populateTransaction(to, amountWei);
  let nonce = startNonce;
  let signed: string | null = null;

  for (let attempt = 0; ; attempt++) {
    try {
      signed ??= await signer.signTransaction(
        await signer.populateTransaction({ ...call, nonce }),
      );
      await provider.broadcastTransaction(signed);
      return { hash: Transaction.from(signed).hash!, nonce };
    } catch (error) {
      if (signed) {
        const hash = Transaction.from(signed).hash!;
        const message = error instanceof Error ? error.message : String(error);
        // Reached the mempool even though the call failed: it is sent.
        if (
          /already known/i.test(message) ||
          (await provider.getTransaction(hash).catch(() => null))
        ) {
          return { hash, nonce };
        }
        if (isNonceTaken(error)) {
          nonce = await provider.getTransactionCount(signer.address, "pending");
          signed = null;
        }
      }
      if (isRevert(error) || attempt >= RETRY_DELAYS_MS.length) throw error;
      console.warn("Airdrop: transfer rejected, retrying", {
        to,
        attempt: attempt + 1,
        error: error instanceof Error ? error.message : String(error),
      });
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const startedAt = Date.now();
  const provider = createBaseProvider({ requestTimeoutMs: RPC_TIMEOUT_MS });

  try {
    const { from, to } = getAirdropWindow(Math.floor(Date.now() / 1000));
    const checkins = await getCheckinsBetween(from, to);

    // One share per wallet, however many check-in rows fall in the window.
    const recipients = new Map<string, string>();
    for (const checkin of checkins) {
      const address = checkin.user?.address;
      if (!address || !isAddress(address)) {
        console.warn("Airdrop: skipping check-in with invalid user", {
          checkin: checkin.id,
          hash: checkin.hash,
          address,
        });
        continue;
      }
      recipients.set(address.toLowerCase(), getAddress(address));
    }

    if (recipients.size === 0) {
      console.log("Airdrop: no check-ins in window", { from, to });
      return new Response("No recent check-ins found", { status: 200 });
    }

    const rewardWei = DAILY_AIRDROP_WEI / BigInt(recipients.size);
    const reward = Number(formatUnits(rewardWei, 18));

    if (!process.env.AIRDROP_BOT_PK) {
      throw new Error("AIRDROP_BOT_PK is not configured");
    }
    const signer = new Wallet(process.env.AIRDROP_BOT_PK, provider);
    const contract = new Contract(
      process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as string,
      BBitsTokenAbi,
      signer,
    );

    // Fail loudly before sending anything rather than paying the first few
    // wallets and reverting on the rest.
    const [bbitsBalance, ethBalance] = await Promise.all([
      contract.balanceOf(signer.address) as Promise<bigint>,
      provider.getBalance(signer.address),
    ]);
    const needed = rewardWei * BigInt(recipients.size);
    if (bbitsBalance < needed) {
      console.error("Airdrop: wallet holds too few BBITS", {
        wallet: signer.address,
        balance: formatUnits(bbitsBalance, 18),
        needed: formatUnits(needed, 18),
      });
      return new Response("Airdrop wallet holds too few BBITS", {
        status: 500,
      });
    }
    if (ethBalance === BigInt(0)) {
      console.error("Airdrop: wallet has no ETH for gas", {
        wallet: signer.address,
      });
      return new Response("Airdrop wallet has no ETH for gas", {
        status: 500,
      });
    }

    // "pending" so we queue behind any in-flight transaction from this wallet
    // (the mention webhook signs with the same key) instead of colliding with it.
    let nonce = await provider.getTransactionCount(signer.address, "pending");
    const failed: string[] = [];
    let lastTx: string | null = null;

    for (const address of recipients.values()) {
      if (Date.now() - startedAt > SEND_DEADLINE_MS) {
        failed.push(address);
        console.error("Airdrop: out of time, not sent", { address });
        continue;
      }
      try {
        const sent = await sendShare(
          signer,
          contract,
          address,
          rewardWei,
          nonce,
        );
        lastTx = sent.hash;
        nonce = sent.nonce + 1;
      } catch (error) {
        failed.push(address);
        console.error("Airdrop: transfer failed", { address, error });
        // Resync rather than guess: a transfer that never reached the mempool
        // must not leave a nonce gap (which would strand every later transfer).
        nonce = await provider.getTransactionCount(signer.address, "pending");
      }
      await sleep(PACE_MS);
    }

    const sent = recipients.size - failed.length;

    // Transactions from one wallet confirm in nonce order, so once the last
    // one has landed every earlier one has too.
    let confirmed = false;
    if (lastTx) {
      try {
        const receipt = await provider.waitForTransaction(
          lastTx,
          1,
          CONFIRMATION_TIMEOUT_MS,
        );
        confirmed = receipt?.status === 1;
        if (!confirmed) {
          console.error("Airdrop: final transfer reverted", { hash: lastTx });
        }
      } catch (error) {
        console.error("Airdrop: final transfer not confirmed in time", {
          hash: lastTx,
          error,
        });
      }
    }

    console.log("Airdrop: run complete", {
      window: { from, to },
      checkins: checkins.length,
      recipients: recipients.size,
      reward,
      sent,
      failed,
      lastTx,
      confirmed,
    });

    if (sent > 0 && confirmed) {
      const message = `Daily BBITS Airdrop sent!\n\n${sent} based frens received ${reward.toFixed(2)} $BBITS each for checking in. Start your streak today! https://www.basedbits.fun`;
      await postToFarcaster(message);
    }

    if (failed.length > 0 || !confirmed) {
      // Non-2xx so the failure shows up in the Vercel cron dashboard.
      return new Response(
        `Daily airdrop incomplete: ${sent}/${recipients.size} sent, confirmed=${confirmed}`,
        { status: 500 },
      );
    }

    return new Response("Daily airdrop sent", {
      status: 200,
    });
  } catch (error) {
    console.error("Airdrop: run failed", error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  } finally {
    provider.destroy();
  }
}
