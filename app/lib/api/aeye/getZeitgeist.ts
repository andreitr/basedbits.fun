import { supabase } from "@/app/lib/supabase/client";
import { DBAeye } from "@/app/lib/types/types";

export async function getZeitgeist(): Promise<DBAeye[]> {
  const { data, error } = await supabase
    .from("zeitgeist")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching zeitgeist:", error);
    return [];
  }

  return data as DBAeye[];
}
