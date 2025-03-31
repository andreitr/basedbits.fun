import { fetchUserDB } from "@/app/lib/api/getUserDB";
import { sendFarcasterDM } from "@/app/lib/external/farcaster";
import { createMessage } from "@/app/lib/supabase/client";
import { NextRequest } from "next/server";
import { isAddress } from "viem";

export async function GET(req: NextRequest) {
  try {
    // const authHeader = req.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response("Unauthorized", {
    //         status: 401,
    //     });
    // }

    const targetAddress = "0x1d671d1B191323A38490972D58354971E5c1cd2A";

    if (!isAddress(targetAddress)) {
      return new Response("Invalid address", { status: 400 });
    }

    const user = await fetchUserDB(targetAddress);

    if (!user.farcaster_name) {
      return new Response("User does not have a Farcaster account", {
        status: 400,
      });
    }

    // Create a message record
    const messageCreated = await createMessage(user.id);
    if (!messageCreated) {
      return new Response("Failed to create message record", { status: 500 });
    }

    const message = `Hello world! This is a test DM from BBITS ${messageCreated.message_hash}`;

    try {
      await sendFarcasterDM(user.farcaster_name, message);
      return new Response("DM sent successfully", { status: 200 });
    } catch (error) {
      console.error("Failed to send DM:", error);
      return new Response("Failed to send DM", { status: 500 });
    }
  } catch (error) {
    console.error("Internal server error:", error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
