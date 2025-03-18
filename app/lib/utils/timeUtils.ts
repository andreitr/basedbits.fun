import { DateTime } from "luxon";

/**
 * Calculates a future time based on UTC hour and formats it with "today" or "tomorrow"
 * @param hour The hour in 24-hour format (UTC)
 * @param minute The minute (defaults to 0)
 * @returns Formatted string like "7:00pm today" or "7:00pm tomorrow"
 */
export function futureLocalTime(hour: number, minute: number = 0): string {
  // Determine the correct time - if current UTC time is past the specified hour, use tomorrow
  let targetTime = DateTime.utc().set({ hour, minute });
  if (DateTime.utc() > targetTime) {
    targetTime = targetTime.plus({ days: 1 });
  }

  // Format the time and determine if it's today or tomorrow in the user's local timezone
  const formattedTime = targetTime.toLocal().toFormat("h:mma").toLowerCase();
  const dayLabel = targetTime.toLocal().hasSame(DateTime.now(), "day")
    ? "today"
    : "tomorrow";

  return `${formattedTime} ${dayLabel}`;
}
