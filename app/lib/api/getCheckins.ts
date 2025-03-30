import { supabase } from "@/app/lib/supabase/client";
import { DBCheckin, DBUser } from "@/app/lib/types/types";

export async function getCheckins(seconds: number = 86400) {
  const now = Math.floor(Date.now() / 1000);
  const timeAgo = now - seconds;

  const { data, error } = await supabase
    .from("checkins")
    .select(
      `
            *,
            user:users(*)
        `,
    )
    .gte("block_timestamp", timeAgo)
    .order("block_number", { ascending: false });

  if (error) {
    throw error;
  }
  return data as (DBCheckin & { user: DBUser })[];
}
