import { formatUnits } from "ethers";
import { WindowPlan } from "./backfillPlan";

/** BBITS amount for display: four decimals, full precision stays in the report. */
const bbits = (wei: bigint) => Number(formatUnits(wei, 18)).toFixed(4);

/** Print the reconciliation result: every window, who was paid, who is missing, and the totals. */
export function printPlan(plan: WindowPlan[]) {
  const transfers = plan.flatMap((w) =>
    w.missed.map((to) => ({ window: w.fromIso, to, amountWei: w.rewardWei })),
  );
  const totalWei = transfers.reduce((sum, t) => sum + t.amountWei, BigInt(0));
  const totalPaidWei = plan.reduce(
    (sum, w) => sum + w.rewardWei * BigInt(w.paid.length),
    BigInt(0),
  );
  const totalBackfilledWei = plan.reduce(
    (sum, w) => sum + w.rewardWei * BigInt(w.backfilled.length),
    BigInt(0),
  );

  console.log("=== Per-window detail ===\n");
  for (const w of plan) {
    const day = `${w.fromIso.slice(0, 16)} → ${w.toIso.slice(0, 16)} UTC`;
    console.log(
      `${day}  ${w.checkins} check-in(s), ${w.recipients} wallet(s), share ${bbits(w.rewardWei)} BBITS`,
    );
    if (w.recipients === 0) {
      console.log("  (no check-ins)\n");
      continue;
    }
    for (const address of w.paid) {
      console.log(`  paid       ${address}`);
    }
    for (const address of w.backfilled) {
      console.log(`  backfilled ${address}`);
    }
    for (const address of w.missed) {
      console.log(
        `  MISSING    ${address}  → send ${bbits(w.rewardWei)} BBITS`,
      );
    }
    console.log(
      `  ${w.paid.length} paid, ${w.backfilled.length} backfilled, ${w.missed.length} missing, ${bbits(
        w.rewardWei * BigInt(w.missed.length),
      )} BBITS to send\n`,
    );
  }

  console.log("=== Summary ===\n");
  console.log(
    "window start (UTC)   check-ins  wallets   paid  backfilled  missed   share (BBITS)   to send (BBITS)",
  );
  for (const w of plan) {
    console.log(
      `${w.fromIso.slice(0, 16).padEnd(20)} ${String(w.checkins).padStart(9)}` +
        `  ${String(w.recipients).padStart(7)}  ${String(w.paid.length).padStart(5)}` +
        `  ${String(w.backfilled.length).padStart(10)}  ${String(w.missed.length).padStart(6)}   ${bbits(w.rewardWei).padStart(13)}   ` +
        `${bbits(w.rewardWei * BigInt(w.missed.length)).padStart(15)}`,
    );
  }

  console.log(
    `\nAlready paid by the cron: ${bbits(totalPaidWei)} BBITS` +
      ` across ${plan.reduce((n, w) => n + w.paid.length, 0)} transfer(s)`,
  );
  console.log(
    `Already backfilled:       ${bbits(totalBackfilledWei)} BBITS` +
      ` across ${plan.reduce((n, w) => n + w.backfilled.length, 0)} transfer(s)`,
  );
  console.log(
    `Missing:                  ${bbits(totalWei)} BBITS` +
      ` across ${transfers.length} transfer(s) to ${new Set(transfers.map((t) => t.to)).size} wallet(s)`,
  );
}
