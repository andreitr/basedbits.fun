import { NextResponse } from "next/server";
import { getOrCreateUser, updateUser } from "@/app/lib/supabase/client";
import { getFarcasterUser, postToFarcaster } from "@/app/lib/external/farcaster";

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
          transaction: {
            hash: string;
            from: { address: string };
            to: { address: string };
          };
        }>;
      };
    };
  };
}

// Event signature for CommunityRewardsClaimed
const COMMUNITY_REWARDS_CLAIMED_EVENT = "0xc89f24ff8af936fe4d715ca7b72cb261116b57a89913be3824d859c51fbcab13"; // keccak256("CommunityRewardsClaimed(uint256,address,uint256)")

// Helper function to extract 20-byte address from 32-byte topic
function extractAddress(topic: string): string {
  // Remove '0x' prefix and take last 40 characters (20 bytes)
  return '0x' + topic.slice(-40).toLowerCase();
}

export async function POST(request: Request) {
  try {
    const payload = JSON.parse(await request.text()) as AEyeWebhookPayload;
    const { block } = payload.event?.data || {};

    if (!block?.logs?.length) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    for (const log of block.logs) {
      if (log.topics[0] !== COMMUNITY_REWARDS_CLAIMED_EVENT) continue;

      const user = log.transaction.from.address.toLowerCase();
      const amount = BigInt(log.data);
      const dbUser = await getOrCreateUser(user);
      
      if (dbUser && !dbUser.farcaster_name) {
        const fcUser = await getFarcasterUser(user);
        if (fcUser) {
          await updateUser(user, {
            farcaster_name: fcUser.username,
            farcaster_avatar: fcUser.avatarUrl || undefined,
          });
          dbUser.farcaster_name = fcUser.username;
        }
      }

      if (dbUser?.farcaster_name) {
        const basescanUrl = `https://basescan.org/tx/${log.transaction.hash}`;
        const message = `${(Number(amount) / 1e18).toFixed(4)} ETH in AEYE community rewards claimed by @${dbUser.farcaster_name}`;
        await postToFarcaster(message, basescanUrl);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: error instanceof Error && error.message.includes("JSON") ? 400 : 500 }
    );
  }
}
