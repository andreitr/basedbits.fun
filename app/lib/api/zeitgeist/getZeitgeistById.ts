import { supabase } from "@/app/lib/supabase/client";
import { DBZeitgeist } from "@/app/lib/types/types";

export async function getZeitgeistById(id: number): Promise<DBZeitgeist | null> {
    const { data, error } = await supabase
        .from("zeitgeist")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching zeitgeist:", error);
        return null;
    }

    return data as DBZeitgeist;
} 