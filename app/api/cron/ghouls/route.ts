import { LuckyGhoulsABI } from "@/app/lib/abi/LuckyGhouls.abi";
import {
  MEGAPOT_V2_JACKPOT_ADDRESS,
  MegapotV2JackpotABI,
} from "@/app/lib/abi/MegapotV2.abi";
import { LUCKY_GHOULS_ADDRESS } from "@/app/lib/contracts/luckyghouls";
import {
  KEEPER_HOUR,
  KEEPER_TIME_ZONE,
  zonedTime,
} from "@/app/lib/luckyghouls/keeperSchedule";
import {
  ghoulsPublicClient,
  readGhoulsDrawings,
} from "@/app/lib/luckyghouls/readGhoulsDrawings";
import { revertName } from "@/app/lib/luckyghouls/revertName";
import { baseRpcUrl } from "@/app/lib/Web3Configs";
import { NextRequest } from "next/server";
import { createWalletClient, formatUnits, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Vercel crons run on UTC, so the job is scheduled at 17:05 and 18:05 UTC and only acts on the run that lands
// on 10:05 in Los Angeles (PDT in summer, PST in winter). A retry at :10 catches a late Megapot settlement or a
// failed first run; the keeper is idempotent, so a retry after a good run does nothing. Pass ?force=1 to run
// outside that hour and ?dry=1 to simulate without sending transactions.
//
// Each run: claims settled drawings, buys the current drawing's tickets, then claims the Megapot referral fees
// that the burner wallet (LuckyGhouls' megapotReferrer) earns on those tickets.

// buyTickets stops cleanly when it nears its gas reserve and resumes on the next call
const MAX_BUY_CALLS = 5;

const RECEIPT_TIMEOUT_MS = 60_000;

// Reverts that mean "nothing to do today" rather than a failure
const EXPECTED_BUY_REVERTS = new Set([
  "TicketsAlreadyPurchased",
  "InsufficientTreasury",
  "InsufficientUSDCForTicket",
  "EnforcedPause",
]);

const ghouls = { abi: LuckyGhoulsABI, address: LUCKY_GHOULS_ADDRESS } as const;
const jackpot = {
  abi: MegapotV2JackpotABI,
  address: MEGAPOT_V2_JACKPOT_ADDRESS,
} as const;

const walletFor = (pk: string) =>
  createWalletClient({
    account: privateKeyToAccount((pk.startsWith("0x") ? pk : `0x${pk}`) as Hex),
    chain: base,
    transport: http(baseRpcUrl),
  });

const describe = (error: unknown) =>
  revertName(error) ??
  (error as { shortMessage?: string }).shortMessage ??
  String(error);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const force = req.nextUrl.searchParams.get("force") === "1";
  // Simulate every call without sending, for checking the keeper against live state
  const dryRun = req.nextUrl.searchParams.get("dry") === "1";
  if (!force && zonedTime(KEEPER_TIME_ZONE).hour !== KEEPER_HOUR) {
    return Response.json({
      skipped: `Not ${KEEPER_HOUR}:00 in ${KEEPER_TIME_ZONE}`,
    });
  }

  const log: string[] = [];
  let failed = false;

  try {
    const wallet = walletFor(process.env.EXECUTER_BOT_PK as string);
    const { account } = wallet;
    const client = ghoulsPublicClient;

    const send = async (
      request: Parameters<typeof wallet.writeContract>[0],
      from = wallet,
    ) => {
      if (dryRun) return "dry run, not sent";
      const hash = await from.writeContract(request);
      const receipt = await client.waitForTransactionReceipt({
        hash,
        timeout: RECEIPT_TIMEOUT_MS,
      });
      if (receipt.status !== "success") throw new Error(`Reverted: ${hash}`);
      return hash;
    };

    // 1. Claim every settled drawing that still holds tickets; winnings are swapped back to ETH by the contract
    const before = await readGhoulsDrawings(client);
    for (const drawing of before.claimable) {
      try {
        const { request } = await client.simulateContract({
          ...ghouls,
          account,
          functionName: "claimWinnings",
          args: [drawing.drawingId],
        });
        const hash = await send(request);
        log.push(
          `Claimed drawing #${drawing.drawingId} (${drawing.ticketCount} tickets, ${drawing.winningTickets} winning): ${hash}`,
        );
      } catch (error) {
        failed = true;
        log.push(
          `Claim for drawing #${drawing.drawingId} failed: ${describe(error)}`,
        );
      }
    }
    if (before.claimable.length === 0) log.push("No tickets to claim");

    // 2. Buy the current drawing's tickets, resuming partial runs
    const now = BigInt(Math.floor(Date.now() / 1000));
    for (let call = 0; call < MAX_BUY_CALLS; call++) {
      const state = await readGhoulsDrawings(client);
      if (state.ticketsBought) {
        log.push(
          `Drawing #${state.currentDrawingId}: ${state.purchaseBought} tickets bought`,
        );
        break;
      }
      // The previous drawing has closed but Megapot hasn't settled it yet, so sales are shut
      if (state.drawingTime <= now) {
        failed = true;
        log.push(
          `Drawing #${state.currentDrawingId} closed and is not settled yet; buy skipped`,
        );
        break;
      }

      try {
        const { request } = await client.simulateContract({
          ...ghouls,
          account,
          functionName: "buyTickets",
        });
        const hash = await send(request);
        log.push(`buyTickets for drawing #${state.currentDrawingId}: ${hash}`);
        // A dry run can't observe progress, so one simulated call is all it can check
        if (dryRun) break;
      } catch (error) {
        const name = revertName(error);
        if (!name || !EXPECTED_BUY_REVERTS.has(name)) failed = true;
        log.push(`buyTickets skipped: ${describe(error)}`);
        break;
      }
    }

    // 3. Claim the burner wallet's Megapot referral fees; claimReferralFees pays msg.sender, so the burner signs
    try {
      const burner = walletFor(process.env.BURNER_BOT_PK as string);
      const fees = await client.readContract({
        ...jackpot,
        functionName: "referralFees",
        args: [burner.account.address],
      });
      if (fees === BigInt(0)) {
        log.push("No referral fees to claim");
      } else {
        const { request } = await client.simulateContract({
          ...jackpot,
          account: burner.account,
          functionName: "claimReferralFees",
        });
        const hash = await send(request, burner);
        log.push(`Claimed ${formatUnits(fees, 6)} USDC referral fees: ${hash}`);
      }
    } catch (error) {
      failed = true;
      log.push(`Referral fee claim failed: ${describe(error)}`);
    }
  } catch (error) {
    failed = true;
    log.push(`Keeper error: ${describe(error)}`);
  }

  console.log("[cron/ghouls]", log.join(" | "));
  return Response.json({ log }, { status: failed ? 500 : 200 });
}
