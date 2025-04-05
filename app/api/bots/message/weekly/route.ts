import { fetchUserDB } from "@/app/lib/api/getUserDB";
import { sendFarcasterDM } from "@/app/lib/external/farcaster";
import {
  createMessage,
  getUsersWithRecentCheckins,
} from "@/app/lib/supabase/client";
import { NextRequest } from "next/server";

const MESSAGE_EXPIRATION_DAYS = 7;
const BOUNTY_AMOUNT = 50;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const users = await getUsersWithRecentCheckins();

    // Don't send to andreit.eth
    const filteredUsers = users.filter((user) => user.id !== 33);

    if (filteredUsers.length === 0) {
      return new Response("No users with recent check-ins found", {
        status: 200,
      });
    }

    // Send messages to each user
    const results = await Promise.allSettled(
      filteredUsers.map(async (user) => {
        try {
          // Create a message record
          const expiresAt = new Date(
            Date.now() + 1000 * 60 * 60 * 24 * MESSAGE_EXPIRATION_DAYS,
          ).toISOString();
          const messageCreated = await createMessage(
            user.id,
            BOUNTY_AMOUNT,
            expiresAt,
          );
          if (!messageCreated) {
            throw new Error("Failed to create message record");
          }

          const message = `Solid work on maintaining your streak! I've sent you an additional ${messageCreated.bounty} BBITS you can claim by going to your Based Bits profile https://www.basedbits.fun/users/${user.address}?message=${messageCreated.rand_hash}`;
          await sendFarcasterDM(user.farcaster_name!, message);
          return { success: true, user: user.farcaster_name };
        } catch (error) {
          console.error(`Failed to send DM to ${user.farcaster_name}:`, error);
          return { success: false, user: user.farcaster_name, error };
        }
      }),
    );

    // Count successful and failed messages
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const failed = results.length - successful;

    return new Response(
      JSON.stringify({
        message: `Sent ${successful} messages successfully, ${failed} failed`,
        details: results.map((r) =>
          r.status === "fulfilled" ? r.value : r.reason,
        ),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Internal server error:", error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
