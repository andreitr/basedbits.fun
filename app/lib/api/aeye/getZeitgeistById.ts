import { supabase } from "@/app/lib/supabase/client";
import { DBAeye } from "@/app/lib/types/types";

export async function getAeyeById(
  id: number,
): Promise<DBAeye | null> {
  const { data, error } = await supabase
    .from("zeitgeist")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching aeye:", error);
    return null;
  }

  return data as DBAeye;
}
