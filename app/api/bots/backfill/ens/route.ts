import { getENSData } from "@/app/lib/api/getENSData";
import { supabase } from "@/app/lib/supabase/client";
import { DBUser } from "@/app/lib/types/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    // Get the 50 stalest users that haven't been updated in 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .lt("updated_at", thirtyDaysAgo.toISOString())
      .order("updated_at", { ascending: true })
      .limit(50);

    if (error) {
      throw error;
    }

    if (!users || users.length === 0) {
      return Response.json({ message: "No users need ENS data update" });
    }

    const results = { processed: 0, updated: 0, failed: 0, dbErrors: 0 };

    for (const user of users) {
      results.processed++;

      const { ensName, ensAvatar, failed } = await getENSData(user.address);

      // Every processed user must produce a real UPDATE so the trigger bumps
      // updated_at; otherwise users without ENS are re-checked on every run.
      // On a failed lookup keep the existing ENS data and only touch the row.
      const updates: Partial<DBUser> = failed
        ? { updated_at: new Date().toISOString() }
        : { ens_name: ensName, ens_avatar: ensAvatar };

      if (failed) {
        results.failed++;
      }

      const { error: updateError } = await supabase
        .from("users")
        .update(updates)
        .eq("address", user.address);

      if (updateError) {
        results.dbErrors++;
        console.error(
          `Failed to update ENS data for ${user.address}:`,
          updateError.message,
        );
      } else if (!failed) {
        results.updated++;
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("Backfill ENS Results:", results);

    return Response.json(results);
  } catch (error) {
    console.error("Failed to backfill ENS data:", error);
    return Response.json(
      { error: "Failed to backfill ENS data" },
      { status: 500 },
    );
  }
}
