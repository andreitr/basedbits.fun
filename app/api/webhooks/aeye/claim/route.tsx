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
const COMMUNITY_REWARDS_CLAIMED_EVENT = "0xc89f24ff8af936fe4d715ca7b72cb261116b57a89913be3824d859c51fbcab13"; // keccak256("CommunityRewardsClaimed(uint256,address,uint256)")

export async function POST(request: Request) {


console.log("AEye claim webhook received");

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

    // Validate block data
    if (!payload.event?.data?.block) {
      console.error("Missing block data in webhook payload");
      return NextResponse.json(
        { error: "Missing block data in webhook payload" },
        { status: 400 },
      );
    }

    const { block } = payload.event.data;
    console.log("Block details:", {
      hash: block.hash,
      number: block.number,
      timestamp: new Date(block.timestamp * 1000).toISOString(),
      logsCount: block.logs?.length || 0,
    });

    if (!block.logs || !Array.isArray(block.logs)) {
      console.error("Invalid logs array in block data");
      return NextResponse.json(
        { error: "Invalid logs array in block data" },
        { status: 400 },
      );
    }

    // Process each log
    for (const log of block.logs) {
      // Extract and log all relevant data from the log
      const tokenId = log.topics[1] ? BigInt(log.topics[1]).toString() : 'N/A';
      const userAddress = log.topics[2] ? log.topics[2].toLowerCase() : 'N/A';
      const amount = log.data ? BigInt(log.data).toString() : 'N/A';
      const amountInEth = log.data ? (Number(BigInt(log.data)) / 1e18).toFixed(4) + " ETH" : 'N/A';

      console.log("Processing log details:", {
        topics: log.topics,
        expectedEvent: COMMUNITY_REWARDS_CLAIMED_EVENT,
        isMatch: log.topics[0] === COMMUNITY_REWARDS_CLAIMED_EVENT,
        tokenId,
        userAddress,
        amount,
        amountInEth,
        data: log.data
      });
      
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
          amountInEth: (Number(amount) / 1e18).toFixed(4) + " ETH",
          transactionHash: log.transaction.hash,
          blockNumber: block.number,
          timestamp: new Date(block.timestamp * 1000).toISOString(),
          claimer: {
            address: user,
            transaction: {
              hash: log.transaction.hash,
              from: log.transaction.from.address,
              to: log.transaction.to.address,
              gasUsed: log.transaction.gasUsed,
              effectiveGasPrice: log.transaction.effectiveGasPrice,
            }
          }
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
