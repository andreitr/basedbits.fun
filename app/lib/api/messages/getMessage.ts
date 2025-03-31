import { supabase } from "@/app/lib/supabase/client";
import { DBMessage } from "@/app/lib/types/types";
import { cache } from "react";

export const fetchMessageDB = async (
  hash: string,
): Promise<DBMessage | null> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("message_hash", hash)
    .single();

  if (error) {
    console.error("Error fetching message:", error);
    return null;
  }
  return data as DBMessage;
};

export const getMessage = cache(fetchMessageDB);
