import { supabase } from "@/app/lib/supabase/client";
import { DBAeye } from "@/app/lib/types/types";
import { cache } from "react";

export const fetchAeyeById = async (id: number): Promise<DBAeye | null> => {
  const { data, error } = await supabase
    .from("aeye")
    .select("*")
    .eq("token", id)
    .single();

  if (error) {
    console.error("Error fetching aeye:", error);
    return null;
  }

  return data as DBAeye;
};

export const getAeyeById = cache(fetchAeyeById);
