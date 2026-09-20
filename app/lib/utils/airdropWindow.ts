export const DAY_SECONDS = 86_400;
// Must match the "/api/cron/airdrop" schedule in vercel.json ("0 7 * * *").
export const AIRDROP_HOUR_UTC = 7;

/**
 * The 24 h reward window for an airdrop run that starts at `nowSeconds`
 * (unix seconds): from the previous scheduled run time up to, but excluding,
 * the most recent one. Half-open, so consecutive days never share a second.
 *
 * Anchoring on the schedule instead of on `Date.now()` matters because the cron
 * never fires at exactly the same second each day. With a rolling
 * `[now - 24h, now]` window, a run that fires later than yesterday's leaves a
 * gap that no run ever covers, and one that fires earlier pays the check-ins
 * in the overlap twice.
 */
export function getAirdropWindow(nowSeconds: number) {
  const dayStart = nowSeconds - (nowSeconds % DAY_SECONDS);
  let windowEnd = dayStart + AIRDROP_HOUR_UTC * 3_600;
  if (windowEnd > nowSeconds) {
    windowEnd -= DAY_SECONDS;
  }
  return { from: windowEnd - DAY_SECONDS, to: windowEnd };
}
