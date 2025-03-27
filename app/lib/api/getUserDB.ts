import { supabase } from "@/app/lib/supabase/client";
import { DBUser } from "@/app/lib/types/types";
import { cache } from "react";
import { emptyDBUser } from "@/app/lib/constants";

export const fetchUserDB = async (address: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("address", address.toLowerCase())
    .single();

  if (error || !data) {
    return emptyDBUser;
  }

  return data as DBUser;
};

export const getUserDB = cache(fetchUserDB);
