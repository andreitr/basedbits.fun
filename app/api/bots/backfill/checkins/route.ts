import {
  createCheckin,
  getOrCreateUser,
  supabase,
} from "@/app/lib/supabase/client";
import { CheckInEvent } from "@/app/lib/types/types";
import { baseRpcUrl } from "@/app/lib/Web3Configs";
import { ethers } from "ethers";
import { NextRequest } from "next/server";

// Create interface for the CheckIn event
const checkInInterface = new ethers.Interface([
  "event CheckIn(address indexed sender, uint256 timestamp, uint16 streak, uint16 totalCheckIns)",
]);

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to batch requests
async function batchGetBlockTimestamps(blockNumbers: string[], batchSize = 10) {
  const results: { [key: string]: number } = {};

  for (let i = 0; i < blockNumbers.length; i += batchSize) {
    const batch = blockNumbers.slice(i, i + batchSize);
    const batchPromises = batch.map(async (blockNumber) => {
      try {
        const response = await fetch(baseRpcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getBlockByNumber",
            params: [blockNumber, false],
          }),
        });

        const data = await response.json();
        return {
          blockNumber,
          timestamp: data.result ? Number(data.result.timestamp) : Number(blockNumber),
        };
      } catch (error) {
        console.error(`Error fetching block ${blockNumber}:`, error);
        return {
          blockNumber,
          timestamp: Number(blockNumber), // Fallback to block number as timestamp
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ blockNumber, timestamp }) => {
      results[blockNumber] = timestamp;
    });

    // Add a small delay between batches to prevent overwhelming the system
    if (i + batchSize < blockNumbers.length) {
      await delay(100);
    }
  }

  return results;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const response = await fetch(baseRpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getLogs",
        params: [
          {
            address: process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS,
            topics: [
              "0x4a86d69d6fc1e14c4d0d43553c3c2740655d55029baf8c564d8e1f702a6b48f2",
            ],
            fromBlock: "0x0",
            toBlock: "latest",
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Get unique block numbers
    const blockNumbers = [...new Set(data.result.map((log: any) => log.blockNumber))] as string[];

    // Get block timestamps in batches
    const blockTimestamps = await batchGetBlockTimestamps(blockNumbers);

    // Decode each log into CheckInEvent format
    const blockchainEvents: CheckInEvent[] = data.result.map((log: any) => {
      const decodedLog = checkInInterface.parseLog({
        topics: log.topics,
        data: log.data,
      });

      if (!decodedLog) {
        throw new Error("Failed to decode event data");
      }

      const blockTimestamp = blockTimestamps[log.blockNumber] || Number(log.blockNumber);

      return {
        sender: decodedLog.args[0].toLowerCase(), // sender address
        timestamp: blockTimestamp, // Using actual block timestamp
        streak: Number(decodedLog.args[2]), // streak
        totalCheckIns: Number(decodedLog.args[3]), // totalCheckIns
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
        blockTimestamp: blockTimestamp, // Using actual block timestamp
      };
    });

    // Get existing check-ins from database
    const { data: existingCheckins, error: dbError } = await supabase
      .from("checkins")
      .select("hash");

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Create a set of existing hashes for O(1) lookup
    const existingHashes = new Set(
      existingCheckins.map((c: { hash: string }) => c.hash),
    );

    // Filter out events that already exist in the database
    const missingEvents = blockchainEvents.filter(
      (event) => !existingHashes.has(event.transactionHash),
    );

    // Create check-ins for missing events with rate limiting
    const results = [];
    for (const event of missingEvents) {
      try {
        // Create or get user
        const user = await getOrCreateUser(event.sender);
        if (!user) {
          console.error(
            `Failed to create/get user for address ${event.sender}`,
          );
          results.push(false);
          continue;
        }

        // Create check-in
        const result = await createCheckin(
          user.user_id,
          event.streak,
          event.totalCheckIns,
          event.transactionHash,
          event.blockNumber,
          event.blockTimestamp,
        );
        results.push(result);

        // Add a small delay between check-in creations
        await delay(50);
      } catch (error) {
        console.error(`Error creating check-in for event ${event.transactionHash}:`, error);
        results.push(false);
      }
    }

    const successCount = results.filter(Boolean).length;
    const failureCount = results.length - successCount;

    // Log the results
    console.log('Backfill Checkins Results:', {
      totalEvents: blockchainEvents.length,
      existingEvents: existingCheckins.length,
      missingEvents: missingEvents.length,
      createdEvents: successCount,
      failedEvents: failureCount,
    });

    return new Response('Backfill completed successfully', {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Backfill Checkins Error:', error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch or decode events" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
