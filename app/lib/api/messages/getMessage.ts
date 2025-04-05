import { supabase } from "@/app/lib/supabase/client";
import { DBMessage } from "@/app/lib/types/types";
import { cache } from "react";

export const fetchMessageDB = async (
  rand_hash: string,
): Promise<DBMessage | null> => {
  const { data, error } = await supabase
    .from("messages")
    .select("id, user_id, bounty, txn_hash, rand_hash, created_at, updated_at")
    .eq("rand_hash", rand_hash)
    .single();

  if (error) {
    console.error("Error fetching message:", error);
    return null;
  }
  return data as DBMessage;
};

export const getMessage = cache(fetchMessageDB);
