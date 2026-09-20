import { formatUnits, getAddress, isAddress, parseUnits } from "ethers";
import { DAY_SECONDS } from "../../app/lib/utils/airdropWindow";

const DAILY_AIRDROP_AMOUNT = 200;
const DAILY_AIRDROP_WEI = parseUnits(DAILY_AIRDROP_AMOUNT.toString(), 18);

// The mention webhook (app/api/webhooks/mention) tips exactly this much from the
// same wallet. Such a transfer is not an airdrop share, so it must not count as
// "already paid".
const MENTION_REWARD_WEI = parseUnits("5", 18);

// The old cron derived each share from a JS float (200 / n, then parseUnits),
// so its on-chain amounts differ from the exact bigint share in the last few
// wei (13.333333333333334 vs 13.333333333333333333). Treat amounts within a
// millionth of a BBITS as the same share.
const AMOUNT_TOLERANCE_WEI = BigInt(1_000_000_000_000);

export type CheckinRow = {
  id: number;
  hash: string;
  block_timestamp: number;
  user: { address: string } | null;
};

export type Payment = {
  to: string;
  amountWei: bigint;
  timestamp: number;
  hash: string;
};

export const iso = (seconds: number) => new Date(seconds * 1000).toISOString();

const sameAmount = (a: bigint, b: bigint) =>
  (a > b ? a - b : b - a) <= AMOUNT_TOLERANCE_WEI;

// ---- plan ------------------------------------------------------------------

export type WindowPlan = {
  from: number;
  to: number;
  fromIso: string;
  toIso: string;
  checkins: number;
  recipients: number;
  rewardWei: bigint;
  reward: string;
  /** Wallets the daily cron paid during this window's payout period. */
  paid: string[];
  /** Wallets paid later, by an earlier run of this backfill. */
  backfilled: string[];
  /** Wallets still owed this window's share. */
  missed: string[];
};

/**
 * Reconcile each window's recipients against the wallet's outgoing transfers.
 *
 * A transfer settles a (wallet, window) pair when it went to that wallet for
 * that window's share. The daily cron's transfers land right after the window
 * closes; a backfill's land whenever it was run. So each window first claims
 * matching transfers from its own payout period, then any later unclaimed one.
 * Every transfer settles at most one pair, which makes re-running the backfill
 * after a partial or staged run safe: what it already sent is not sent again.
 */
export function buildPlan(
  windows: { from: number; to: number }[],
  checkins: CheckinRow[],
  payments: Payment[],
): WindowPlan[] {
  const available = payments
    .filter((p) => !sameAmount(p.amountWei, MENTION_REWARD_WEI))
    .map((p) => ({ ...p, claimed: false }));
  const byWallet = new Map<string, typeof available>();
  for (const p of available) {
    const list = byWallet.get(p.to) ?? [];
    list.push(p);
    byWallet.set(p.to, list);
  }
  const claim = (
    wallet: string,
    amountWei: bigint,
    from: number,
    to: number,
  ): boolean => {
    const candidates = (byWallet.get(wallet) ?? [])
      .filter(
        (p) =>
          !p.claimed &&
          p.timestamp >= from &&
          p.timestamp < to &&
          sameAmount(p.amountWei, amountWei),
      )
      .sort((a, b) => a.timestamp - b.timestamp);
    if (candidates.length === 0) return false;
    candidates[0].claimed = true;
    return true;
  };

  const prepared = windows.map(({ from, to }) => {
    const rows = checkins.filter(
      (r) => r.block_timestamp >= from && r.block_timestamp < to,
    );
    const recipients = new Map<string, string>();
    for (const row of rows) {
      const address = row.user?.address;
      if (!address || !isAddress(address)) {
        console.warn(
          `  skipping check-in ${row.id} (${row.hash}): invalid user`,
        );
        continue;
      }
      recipients.set(address.toLowerCase(), getAddress(address));
    }
    const rewardWei =
      recipients.size > 0
        ? DAILY_AIRDROP_WEI / BigInt(recipients.size)
        : BigInt(0);
    return { from, to, checkins: rows.length, recipients, rewardWei };
  });

  // Pass 1: the cron's own payout, made between this window's close and the next.
  const paid = prepared.map((w) => {
    const set = new Set<string>();
    for (const wallet of w.recipients.keys()) {
      if (claim(wallet, w.rewardWei, w.to, w.to + DAY_SECONDS)) set.add(wallet);
    }
    return set;
  });

  // Pass 2: a later transfer of exactly this window's share, i.e. a previous backfill.
  const backfilled = prepared.map((w, i) => {
    const set = new Set<string>();
    for (const wallet of w.recipients.keys()) {
      if (paid[i].has(wallet)) continue;
      if (claim(wallet, w.rewardWei, w.to, Number.MAX_SAFE_INTEGER))
        set.add(wallet);
    }
    return set;
  });

  return prepared.map((w, i) => {
    const paidList: string[] = [];
    const backfilledList: string[] = [];
    const missed: string[] = [];
    for (const [lower, checksummed] of w.recipients) {
      if (paid[i].has(lower)) paidList.push(checksummed);
      else if (backfilled[i].has(lower)) backfilledList.push(checksummed);
      else missed.push(checksummed);
    }
    return {
      from: w.from,
      to: w.to,
      fromIso: iso(w.from),
      toIso: iso(w.to),
      checkins: w.checkins,
      recipients: w.recipients.size,
      rewardWei: w.rewardWei,
      reward: formatUnits(w.rewardWei, 18),
      paid: paidList,
      backfilled: backfilledList,
      missed,
    };
  });
}
