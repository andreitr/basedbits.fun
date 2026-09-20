import { formatUnits, getAddress, isAddress, parseUnits } from "ethers";
import { DAY_SECONDS } from "../../app/lib/utils/airdropWindow";

const DAILY_AIRDROP_AMOUNT = 200;
const DAILY_AIRDROP_WEI = parseUnits(DAILY_AIRDROP_AMOUNT.toString(), 18);

// The mention webhook (app/api/webhooks/mention) tips exactly this much from the
// same wallet. Such a transfer is not an airdrop share, so it must not count as
// "already paid".
const MENTION_REWARD_WEI = parseUnits("5", 18);

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
  paid: string[];
  missed: string[];
};

export function buildPlan(
  windows: { from: number; to: number }[],
  checkins: CheckinRow[],
  payments: Payment[],
): WindowPlan[] {
  return windows.map(({ from, to }) => {
    const recipients = new Map<string, string>();
    for (const row of checkins) {
      if (row.block_timestamp < from || row.block_timestamp >= to) continue;
      const address = row.user?.address;
      if (!address || !isAddress(address)) {
        console.warn(
          `  skipping check-in ${row.id} (${row.hash}): invalid user`,
        );
        continue;
      }
      recipients.set(address.toLowerCase(), getAddress(address));
    }

    // The cron for this window fires at `to`; anything it (or a manual re-run)
    // sent before the next window's cron counts as this window's payout.
    const payoutFrom = to;
    const payoutTo = to + DAY_SECONDS;
    const paidSet = new Set(
      payments
        .filter(
          (p) =>
            p.timestamp >= payoutFrom &&
            p.timestamp < payoutTo &&
            p.amountWei !== MENTION_REWARD_WEI,
        )
        .map((p) => p.to),
    );

    const rewardWei =
      recipients.size > 0
        ? DAILY_AIRDROP_WEI / BigInt(recipients.size)
        : BigInt(0);
    const paid: string[] = [];
    const missed: string[] = [];
    for (const [lower, checksummed] of recipients) {
      (paidSet.has(lower) ? paid : missed).push(checksummed);
    }

    return {
      from,
      to,
      fromIso: iso(from),
      toIso: iso(to),
      checkins: checkins.filter(
        (r) => r.block_timestamp >= from && r.block_timestamp < to,
      ).length,
      recipients: recipients.size,
      rewardWei,
      reward: formatUnits(rewardWei, 18),
      paid,
      missed,
    };
  });
}
