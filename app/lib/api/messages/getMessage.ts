import { supabase } from "@/app/lib/supabase/client";
import { DBMessage } from "@/app/lib/types/types";
import { cache } from "react";

export const fetchMessageDB = async (id: number): Promise<DBMessage | null> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching message:", error);
    return null;
  }
  return data as DBMessage;
};

export const getMessage = cache(fetchMessageDB);
