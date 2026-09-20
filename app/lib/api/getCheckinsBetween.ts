import { supabase } from "@/app/lib/supabase/client";
import { DBCheckin, DBUser } from "@/app/lib/types/types";

/**
 * Check-ins whose block timestamp falls in the half-open window
 * [fromTimestamp, toTimestamp), both in unix seconds.
 *
 * Unlike `getCheckins(seconds)`, the window is fixed by the caller rather
 * than anchored to `Date.now()`, so two consecutive daily runs can neither
 * overlap nor leave a gap when the cron fires a few minutes early or late.
 */
export async function getCheckinsBetween(
  fromTimestamp: number,
  toTimestamp: number,
) {
  const { data, error } = await supabase
    .from("checkins")
    .select(
      `
            *,
            user:users(*)
        `,
    )
    .gte("block_timestamp", fromTimestamp)
    .lt("block_timestamp", toTimestamp)
    .order("block_number", { ascending: true });

  if (error) {
    throw error;
  }
  return data as (DBCheckin & { user: DBUser | null })[];
}
