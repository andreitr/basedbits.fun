import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { getCheckinsBetween } from "@/app/lib/api/getCheckinsBetween";
import { postToFarcaster } from "@/app/lib/external/farcaster";
import { getAirdropWindow } from "@/app/lib/utils/airdropWindow";
import { createBaseProvider } from "@/app/lib/Web3Configs";
import {
  Contract,
  formatUnits,
  parseUnits,
  TransactionResponse,
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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

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
    let lastTx: TransactionResponse | null = null;

    for (const address of recipients.values()) {
      try {
        lastTx = await contract.transfer(address, rewardWei, {
          nonce: nonce++,
        });
      } catch (error) {
        failed.push(address);
        console.error("Airdrop: transfer failed", { address, error });
      }
    }

    const sent = recipients.size - failed.length;

    // Transactions from one wallet confirm in nonce order, so once the last
    // one has landed every earlier one has too.
    let confirmed = false;
    if (lastTx) {
      try {
        const receipt = await lastTx.wait(1, CONFIRMATION_TIMEOUT_MS);
        confirmed = receipt?.status === 1;
        if (!confirmed) {
          console.error("Airdrop: final transfer reverted", {
            hash: lastTx.hash,
          });
        }
      } catch (error) {
        console.error("Airdrop: final transfer not confirmed in time", {
          hash: lastTx.hash,
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
      lastTx: lastTx?.hash,
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
