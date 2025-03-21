import {
  getFarcasterUser,
  postToFarcaster,
} from "@/app/lib/external/farcaster";
import {
  createCheckin,
  getOrCreateUser,
  updateUser,
} from "@/app/lib/supabase/client";
import { ethers } from "ethers";
import { NextResponse } from "next/server";

interface BlockchainLog {
  data: string;
  topics: string[];
  index: number;
  account: {
    address: string;
  };
  transaction: {
    hash: string;
    from: {
      address: string;
    };
  };
}

interface GraphQLWebhookPayload {
  webhookId: string;
  id: string;
  createdAt: string;
  type: string;
  event: {
    data: {
      block: {
        hash: string;
        number: number;
        timestamp: number;
        logs: BlockchainLog[];
      };
    };
    sequenceNumber: string;
    network: string;
  };
}

interface CheckInEvent {
  sender: string;
  timestamp: number;
  streak: number;
  totalCheckIns: number;
}

// Create interface for the CheckIn event
const checkInInterface = new ethers.Interface([
  "event CheckIn(address indexed sender, uint256 timestamp, uint16 streak, uint16 totalCheckIns)",
]);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as GraphQLWebhookPayload;

    if (
      !payload.event?.data?.block?.logs ||
      !Array.isArray(payload.event.data.block.logs) ||
      payload.event.data.block.logs.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid webhook payload structure" },
        { status: 400 },
      );
    }

    // Extract the event data
    const eventData = payload.event.data.block.logs[0];

    // Decode the event data
    const decodedLog = checkInInterface.parseLog({
      topics: eventData.topics,
      data: eventData.data,
    });

    if (!decodedLog) {
      return NextResponse.json(
        { error: "Failed to decode event data" },
        { status: 400 },
      );
    }

    // Parse the event data
    const checkInEvent: CheckInEvent = {
      sender: decodedLog.args[0].toLowerCase(), // sender address
      timestamp: payload.event.data.block.timestamp,
      streak: Number(decodedLog.args[2]), // streak
      totalCheckIns: Number(decodedLog.args[3]), // totalCheckIns
    };

    // Create or update user in database
    let user = await getOrCreateUser(checkInEvent.sender);
    if (!user) {
      return NextResponse.json(
        { error: "Failed to create/update user in database" },
        { status: 500 },
      );
    }
    // Create checkin record
    await createCheckin(
      user.user_id,
      checkInEvent.streak,
      checkInEvent.totalCheckIns,
      eventData.transaction.hash,
    );

    // Try to get Farcaster username if not already set
    if (!user.farcaster_name) {
      try {
        const fcUser = await getFarcasterUser(checkInEvent.sender);
        if (fcUser) {
          const updates = {
            farcaster_name: fcUser.username,
            farcaster_avatar: fcUser.avatarUrl || undefined,
          };

          const updatedUser = await updateUser(checkInEvent.sender, updates);
          if (updatedUser) {
            user = updatedUser;
          }
        }
      } catch (error) {
        console.warn("Failed to fetch Farcaster username:", error);
      }
    }

    // Only post to Farcaster if we have a username
    if (user.farcaster_name) {
      const success = await postToFarcaster(
        `${checkInEvent.streak}-day streak 🔥 by @${user.farcaster_name}`,
        `https://www.basedbits.fun/users/${checkInEvent.sender}`,
      );

      if (!success) {
        throw new Error("Failed to post to Farcaster");
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log the full error for debugging
    console.error("Full error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes("parseLog")) {
        return NextResponse.json(
          { error: "Failed to parse blockchain event data" },
          { status: 400 },
        );
      }
      if (error.message === "Failed to post to Farcaster") {
        return NextResponse.json(
          { error: "Failed to post to Farcaster" },
          { status: 503 },
        );
      }
    }

    // Default error response
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
