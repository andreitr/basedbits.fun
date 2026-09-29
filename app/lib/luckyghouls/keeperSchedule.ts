// When the Lucky Ghouls keeper (/api/cron/ghouls) buys the day's tickets and claims winnings. Vercel crons run
// on UTC, so jobs pinned to this hour check the local clock themselves (PDT in summer, PST in winter). Shared
// with the ghouls arb bot, whose daily reprice has to follow the keeper: that is when the redeem price moves.
export const KEEPER_TIME_ZONE = "America/Los_Angeles";
export const KEEPER_HOUR = 10;

// Wall-clock hour (0-23) and minute in `timeZone`
export const zonedTime = (timeZone: string, date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { hour: part("hour"), minute: part("minute") };
};
