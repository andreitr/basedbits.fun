import { supabase } from "@/app/lib/supabase/client";
import { DBMessage } from "@/app/lib/types/types";
import { cache } from "react";

export const claimMessageDB = async (message: DBMessage): Promise<DBMessage | null> => {
    const { data, error } = await supabase
        .from("messages")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", message.id)
        .select()
        .single();

    if (error) {
        console.error("Error claiming message:", error);
        return null;
    }
    return data as DBMessage;
};

export const claimMessage = cache(claimMessageDB); 