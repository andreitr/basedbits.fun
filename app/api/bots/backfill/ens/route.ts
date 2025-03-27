import { supabase } from "@/app/lib/supabase/client";
import { NextRequest } from "next/server";
import { getENSData } from "@/app/lib/api/getENSData";

export async function GET(req: NextRequest) {
    try {

        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response("Unauthorized", {
                status: 401,
            });
        }

        // Get users that haven't been updated in 30 days, limited to 50
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: users, error } = await supabase
            .from("users")
            .select("*")
            .lt("updated_at", thirtyDaysAgo.toISOString())
            .limit(50);

        if (error) {
            throw error;
        }

        if (!users || users.length === 0) {
            return new Response(
                JSON.stringify({
                    message: "No users need ENS data update",
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        let processedCount = 0;
        let updatedCount = 0;

        // Process each user
        for (const user of users) {
            try {
                processedCount++;

                // Get ENS data
                const { ensName, ensAvatar } = await getENSData(user.address);

                const updates: any = {};

                if (ensName) {
                    updates.ens_name = ensName;
                }

                if (ensAvatar) {
                    updates.ens_avatar = ensAvatar;
                }

                // Update user in database
                const { error: updateError } = await supabase
                    .from("users")
                    .update(updates)
                    .eq("address", user.address);

                if (!updateError) {
                    updatedCount++;
                }

                // Add a small delay to avoid rate limiting
                await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (error) {
                continue;
            }
        }

        return new Response(
            JSON.stringify({
                message: "ENS backfill completed",
                processed: processedCount,
                updated: updatedCount,
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: "Failed to backfill ENS data",
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    }
} 