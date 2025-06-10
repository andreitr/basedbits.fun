import { postToFarcaster } from "@/app/lib/external/farcaster";
import { NextResponse } from "next/server";

interface AEyeWebhookPayload {
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
        logs: Array<{
          data: string;
          topics: string[];
          index: number;
          account: {
            address: string;
          };
          transaction: {
            hash: string;
            nonce: number;
            index: number;
            from: {
              address: string;
            };
            to: {
              address: string;
            };
            value: string;
            gasPrice: string;
            maxFeePerGas: string;
            maxPriorityFeePerGas: string;
            gas: number;
            status: number;
            gasUsed: number;
            cumulativeGasUsed: number;
            effectiveGasPrice: string;
            createdContract: null | {
              address: string;
            };
          };
        }>;
      };
      sequenceNumber: string;
      network: string;
    };
  };
}

// Event signature for CommunityRewardsClaimed
const COMMUNITY_REWARDS_CLAIMED_EVENT = "CommunityRewardsClaimed(uint256,address,uint256)";


export async function GET(request: Request) {
  
  try {
    const message = "June 9th AEYE displatch is Minting on https://www.basedbits.fun/aeye";
    const imageUrl = "https://basedbits.mypinata.cloud/ipfs/QmSdtNvHgDFeERkXuE6f9xp76TAEhZsEvBoFftW2vGEW4H";
    
    const success = await postToFarcaster(message, undefined, imageUrl);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to post to Farcaster" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error posting to Farcaster:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Hello, world!" });
}
export async function POST(request: Request) {

  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody) as AEyeWebhookPayload;

    // Log the full webhook payload for debugging
    console.log("AEye claim webhook received:", {
      webhookId: payload.webhookId,
      type: payload.type,
      timestamp: payload.createdAt,
      eventData: payload.event.data,
    });

    if (!payload.event?.data?.block?.logs) {
      return NextResponse.json(
        { error: "Invalid webhook payload structure" },
        { status: 400 },
      );
    }

    // Process each log
    for (const log of payload.event.data.block.logs) {
      // Check if this is a CommunityRewardsClaimed event
      if (log.topics[0] === COMMUNITY_REWARDS_CLAIMED_EVENT) {
        // Parse the event data
        const tokenId = BigInt(log.topics[1]); // First indexed parameter
        const user = log.topics[2].toLowerCase(); // Second indexed parameter (address)
        const amount = BigInt(log.data); // Non-indexed parameter

        // Log the claim event details
        console.log("AEye Community Rewards Claimed:", {
          tokenId: tokenId.toString(),
          user,
          amount: amount.toString(),
          transactionHash: log.transaction.hash,
          blockNumber: payload.event.data.block.number,
          timestamp: new Date(payload.event.data.block.timestamp * 1000).toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log the full error for debugging
    console.error("AEye claim webhook processing error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes("JSON")) {
        return NextResponse.json(
          { error: "Invalid JSON payload" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
