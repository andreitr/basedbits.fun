/**
 * One-time backfill for missed daily BBITS airdrops.
 *
 * For each daily reward window in the requested range it
 *   1. loads the check-ins from Supabase and derives the unique wallets that
 *      should have been paid (one share of 200 BBITS each),
 *   2. loads the BBITS transfers the airdrop wallet actually sent on-chain
 *      during that window's payout period (Alchemy `alchemy_getAssetTransfers`),
 *   3. pays only the wallets that never received their share.
 *
 * Nothing is sent unless `--execute` is passed. A dry run prints the plan and
 * writes it to a JSON report so it can be reviewed first.
 *
 *   npx tsx scripts/backfill-airdrop.ts                # dry run, last 30 days
 *   npx tsx scripts/backfill-airdrop.ts --days 14      # dry run, last 14 days
 *   npx tsx scripts/backfill-airdrop.ts --execute      # send the missing shares
 *
 * Reads .env.local / .env from the repo root (same loader Next.js uses) and
 * needs: AIRDROP_BOT_PK, NEXT_PUBLIC_ALCHEMY_ID, NEXT_PUBLIC_BB_TOKEN_ADDRESS,
 * NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */

import { loadEnvConfig } from "@next/env";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Contract,
  formatUnits,
  getAddress,
  JsonRpcProvider,
  TransactionResponse,
  Wallet,
} from "ethers";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DAY_SECONDS, getAirdropWindow } from "../app/lib/utils/airdropWindow";
import { buildPlan, CheckinRow, iso, Payment } from "./lib/backfillPlan";
import { printPlan } from "./lib/printPlan";

loadEnvConfig(process.cwd());

// ---- configuration ---------------------------------------------------------

const CONFIRMATION_TIMEOUT_MS = 120_000;

// Each transfer costs several RPC calls; Alchemy's free tier throttles bursts.
// Pace the sends and retry transient failures with a growing pause.
const PACE_MS = 1_000;
const RETRY_DELAYS_MS = [2_000, 5_000, 15_000];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A failure the chain itself reported: retrying cannot change the outcome. */
const isRevert = (error: unknown) => {
  const code = (error as { code?: string })?.code;
  const message = error instanceof Error ? error.message : String(error);
  return (
    code === "CALL_EXCEPTION" ||
    code === "INSUFFICIENT_FUNDS" ||
    /revert|insufficient|exceeds balance/i.test(message)
  );
};

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

// ---- CLI -------------------------------------------------------------------

function parseArgs(argv: string[]) {
  const args = {
    days: 30,
    execute: false,
    report: "airdrop-backfill-report.json",
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--execute") args.execute = true;
    else if (arg === "--days") args.days = Number(argv[++i]);
    else if (arg === "--report") args.report = argv[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(args.days) || args.days < 1 || args.days > 366) {
    throw new Error("--days must be an integer between 1 and 366");
  }
  return args;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

// ---- data sources ----------------------------------------------------------

/** All check-ins with block_timestamp in [from, to), paging past Supabase's 1000-row cap. */
async function loadCheckins(
  supabase: SupabaseClient,
  from: number,
  to: number,
): Promise<CheckinRow[]> {
  const PAGE = 1000;
  const rows: CheckinRow[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase
      .from("checkins")
      .select("id, hash, block_timestamp, user:users(address)")
      .gte("block_timestamp", from)
      .lt("block_timestamp", to)
      .order("block_timestamp", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as unknown as CheckinRow[]));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

type AssetTransfer = {
  hash: string;
  to: string | null;
  rawContract: { value: string | null };
  metadata: { blockTimestamp: string };
};

/**
 * Every BBITS transfer the airdrop wallet sent since `fromTimestamp`.
 * Base seals a block every 2 s, so the start block is estimated from the
 * timestamp with a generous margin and the result filtered by exact timestamp.
 */
async function loadOnChainPayments(
  provider: JsonRpcProvider,
  wallet: string,
  token: string,
  fromTimestamp: number,
): Promise<Payment[]> {
  const latest = await provider.getBlock("latest");
  if (!latest) throw new Error("Could not read the latest block");
  const secondsBack = latest.timestamp - fromTimestamp;
  const blocksBack = Math.ceil((secondsBack / 2) * 1.1) + 1_000;
  const fromBlock = Math.max(0, latest.number - blocksBack);

  const payments: Payment[] = [];
  let pageKey: string | undefined;
  do {
    const page = (await provider.send("alchemy_getAssetTransfers", [
      {
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: "latest",
        fromAddress: wallet,
        contractAddresses: [token],
        category: ["erc20"],
        withMetadata: true,
        excludeZeroValue: false,
        maxCount: "0x3e8",
        order: "asc",
        ...(pageKey ? { pageKey } : {}),
      },
    ])) as { transfers: AssetTransfer[]; pageKey?: string };

    for (const transfer of page.transfers) {
      if (!transfer.to || !transfer.rawContract.value) continue;
      const timestamp = Math.floor(
        Date.parse(transfer.metadata.blockTimestamp) / 1000,
      );
      if (timestamp < fromTimestamp) continue;
      payments.push({
        to: transfer.to.toLowerCase(),
        amountWei: BigInt(transfer.rawContract.value),
        timestamp,
        hash: transfer.hash,
      });
    }
    pageKey = page.pageKey;
  } while (pageKey);

  return payments;
}

// ---- main ------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
  const provider = new JsonRpcProvider(
    `https://base-mainnet.g.alchemy.com/v2/${requireEnv("NEXT_PUBLIC_ALCHEMY_ID")}`,
    { chainId: 8453, name: "base" },
    { staticNetwork: true },
  );
  const signer = new Wallet(requireEnv("AIRDROP_BOT_PK"), provider);
  const tokenAddress = getAddress(requireEnv("NEXT_PUBLIC_BB_TOKEN_ADDRESS"));
  const token = new Contract(tokenAddress, ERC20_ABI, signer);

  // Most recent completed window first, then walk back `days` windows.
  const latestWindow = getAirdropWindow(Math.floor(Date.now() / 1000));
  const windows = Array.from({ length: args.days }, (_, i) => ({
    from: latestWindow.from - i * DAY_SECONDS,
    to: latestWindow.to - i * DAY_SECONDS,
  })).reverse();
  const rangeFrom = windows[0].from;
  const rangeTo = windows[windows.length - 1].to;

  console.log(`Airdrop wallet: ${signer.address}`);
  console.log(`Token:          ${tokenAddress}`);
  console.log(
    `Windows:        ${args.days} × 24 h, ${iso(rangeFrom)} → ${iso(rangeTo)}`,
  );
  console.log(`Mode:           ${args.execute ? "EXECUTE" : "dry run"}\n`);

  console.log("Loading check-ins…");
  const checkins = await loadCheckins(supabase, rangeFrom, rangeTo);
  console.log(`  ${checkins.length} check-ins`);

  console.log("Loading on-chain BBITS transfers from the airdrop wallet…");
  const payments = await loadOnChainPayments(
    provider,
    signer.address,
    tokenAddress,
    rangeFrom,
  );
  console.log(`  ${payments.length} transfers\n`);

  const plan = buildPlan(windows, checkins, payments);

  const transfers = plan.flatMap((w) =>
    w.missed.map((to) => ({ window: w.fromIso, to, amountWei: w.rewardWei })),
  );
  const totalWei = transfers.reduce((sum, t) => sum + t.amountWei, BigInt(0));

  printPlan(plan);

  const reportPath = resolve(process.cwd(), args.report);
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        wallet: signer.address,
        token: tokenAddress,
        mode: args.execute ? "execute" : "dry-run",
        windows: plan.map((w) => ({ ...w, rewardWei: w.rewardWei.toString() })),
        transfers: transfers.map((t) => ({
          ...t,
          amount: formatUnits(t.amountWei, 18),
          amountWei: t.amountWei.toString(),
        })),
        totalBbits: formatUnits(totalWei, 18),
      },
      null,
      2,
    ),
  );
  console.log(`Report written to ${reportPath}`);

  if (transfers.length === 0) {
    console.log("Nothing to send.");
    return;
  }
  if (!args.execute) {
    console.log("\nDry run: nothing sent. Re-run with --execute to send.");
    return;
  }

  // ---- execute -------------------------------------------------------------

  const [bbitsBalance, ethBalance] = await Promise.all([
    token.balanceOf(signer.address) as Promise<bigint>,
    provider.getBalance(signer.address),
  ]);
  console.log(
    `\nWallet holds ${formatUnits(bbitsBalance, 18)} BBITS and ${formatUnits(ethBalance, 18)} ETH`,
  );
  if (bbitsBalance < totalWei) {
    throw new Error(
      `Wallet holds too few BBITS: need ${formatUnits(totalWei, 18)}, have ${formatUnits(bbitsBalance, 18)}`,
    );
  }
  if (ethBalance === BigInt(0)) {
    throw new Error("Wallet has no ETH for gas");
  }

  let nonce = await provider.getTransactionCount(signer.address, "pending");
  const sent: { to: string; window: string; hash: string }[] = [];
  const failed: { to: string; window: string; error: string }[] = [];
  let lastTx: TransactionResponse | null = null;

  /** Pending nonce, retried because the read itself can be throttled. */
  const pendingNonce = async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await provider.getTransactionCount(signer.address, "pending");
      } catch (error) {
        if (attempt >= RETRY_DELAYS_MS.length) throw error;
        await sleep(RETRY_DELAYS_MS[attempt]);
      }
    }
  };

  for (const t of transfers) {
    const label = `${t.to} (${t.window.slice(0, 10)})`;
    let done = false;
    for (
      let attempt = 0;
      attempt <= RETRY_DELAYS_MS.length && !done;
      attempt++
    ) {
      try {
        const tx: TransactionResponse = await token.transfer(
          t.to,
          t.amountWei,
          { nonce },
        );
        nonce++;
        lastTx = tx;
        sent.push({ to: t.to, window: t.window, hash: tx.hash });
        console.log(
          `  sent ${formatUnits(t.amountWei, 18)} BBITS to ${label} ${tx.hash}`,
        );
        done = true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        // Did the attempt reach the mempool even though the call failed? Then it
        // is sent: never re-send it, and move past its nonce.
        const pending = await pendingNonce();
        if (pending > nonce) {
          nonce = pending;
          sent.push({ to: t.to, window: t.window, hash: "unknown" });
          console.warn(
            `  sent ${formatUnits(t.amountWei, 18)} BBITS to ${label} (broadcast, response lost: ${message})`,
          );
          done = true;
          break;
        }

        if (isRevert(error) || attempt === RETRY_DELAYS_MS.length) {
          failed.push({ to: t.to, window: t.window, error: message });
          console.error(`  FAILED ${label}: ${message}`);
          break;
        }
        console.warn(
          `  retry ${attempt + 1}/${RETRY_DELAYS_MS.length} for ${label} in ${RETRY_DELAYS_MS[attempt] / 1000}s: ${message}`,
        );
        await sleep(RETRY_DELAYS_MS[attempt]);
      }
    }
    await sleep(PACE_MS);
  }

  let confirmed = false;
  if (lastTx) {
    console.log(`\nWaiting for the last transfer ${lastTx.hash} to confirm…`);
    try {
      const receipt = await lastTx.wait(1, CONFIRMATION_TIMEOUT_MS);
      confirmed = receipt?.status === 1;
    } catch (error) {
      console.error("  not confirmed in time:", error);
    }
  }

  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        ...JSON.parse(readFileSync(reportPath, "utf8")),
        result: { sent, failed, lastTx: lastTx?.hash ?? null, confirmed },
      },
      null,
      2,
    ),
  );

  console.log(
    `\nDone: ${sent.length} sent, ${failed.length} failed, last transfer confirmed=${confirmed}`,
  );
  console.log(`Report updated at ${reportPath}`);
  if (failed.length > 0 || !confirmed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
