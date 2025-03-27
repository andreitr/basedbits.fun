import { emptyDBCheckin } from "@/app/lib/constants";
import { supabase } from "@/app/lib/supabase/client";
import { DBCheckin, DBUser } from "@/app/lib/types/types";
import { cache } from "react";

export const fetchCheckinDB = async (address: string) => {
    const { data, error } = await supabase
        .from("users")
        .select("*, checkins:checkins!checkins_user_id_fkey(*)")
        .eq("address", address.toLowerCase())
        .single();

    if (error || !data) {
        // Handle no user found
    }

    // Choose the latest checkin (if any)
    const latestCheckin = data.checkins?.sort((a: DBCheckin, b: DBCheckin) => b.block_number - a.block_number)[0];

    return {
        ...emptyDBCheckin,
        ...latestCheckin,
        user: data,
    } as DBCheckin & { user: DBUser };
};

export const getCheckinDB = cache(fetchCheckinDB);