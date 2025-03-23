import { getOrCreateUser, supabase } from "@/app/lib/supabase/client";
import { baseRpcUrl } from "@/app/lib/Web3Configs";
import { ethers } from "ethers";
import { NextRequest } from "next/server";

// Create interface for the CheckIn event
const checkInInterface = new ethers.Interface([
  "event CheckIn(address indexed sender, uint256 timestamp, uint16 streak, uint16 totalCheckIns)",
]);

// Helper function to get block timestamp
async function getBlockTimestamp(blockNumber: string): Promise<number> {
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
    return data.result ? Number(data.result.timestamp) : Number(blockNumber);
  } catch (error) {
    console.error(`Error fetching block ${blockNumber}:`, error);
    return Number(blockNumber); // Fallback to block number as timestamp
  }
}

export async function GET(req: NextRequest) {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS;
    console.log("Contract Address:", contractAddress);

    // Get current block number first
    const currentBlockResponse = await fetch(baseRpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
      }),
    });

    const currentBlockData = await currentBlockResponse.json();
    const currentBlock = parseInt(currentBlockData.result, 16);
    console.log("Current block:", currentBlock);

    let fromBlock = 26034294;
    let allEvents: any[] = [];
    const uniqueTransactionHashes = new Set<string>();

    // Calculate the event signature hash for the CheckIn event
    const checkInEvent = checkInInterface.getEvent("CheckIn");
    if (!checkInEvent) {
      throw new Error("CheckIn event not found in interface");
    }
    const checkInEventSignature = checkInEvent.topicHash;

    while (fromBlock < currentBlock) {
      const toBlock = Math.min(fromBlock + 10000, currentBlock);
      const fromBlockHex = `0x${fromBlock.toString(16)}`;
      const toBlockHex = `0x${toBlock.toString(16)}`;

      console.log(`Fetching logs from block ${fromBlockHex} to ${toBlockHex}`);

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
              address: contractAddress,
              topics: [checkInEventSignature],
              fromBlock: fromBlockHex,
              toBlock: toBlockHex,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("RPC Error:", data.error);
        if (data.error.code === -32005) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        return new Response(JSON.stringify({ error: data.error }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      if (data.result && data.result.length > 0) {
        allEvents = allEvents.concat(data.result);
        console.log(`Found ${data.result.length} events in this chunk`);
      }

      fromBlock = toBlock + 1;
    }

    if (allEvents.length === 0) {
      console.log("No events found in any chunk");
      return new Response(
        JSON.stringify({
          message: "No new events to process",
          currentBlock,
          contractAddress,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.log(`Found total of ${allEvents.length} events`);

    // First, get all existing checkins to filter out duplicates
    const existingCheckins = await supabase
      .from("checkins")
      .select("hash")
      .in("hash", Array.from(uniqueTransactionHashes));

    const existingHashes = new Set(
      existingCheckins.data?.map((c: { hash: string }) => c.hash) || [],
    );

    // Filter out events that already exist in the database
    const newEvents = allEvents.filter(
      (log: any) => !existingHashes.has(log.transactionHash),
    );
    console.log(`Found ${newEvents.length} new events to process`);

    if (newEvents.length === 0) {
      console.log("No new events to process");
      return new Response(
        JSON.stringify({
          message: "No new events to process",
          currentBlock,
          contractAddress,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Process new events one by one
    let processedCount = 0;
    for (const log of newEvents) {
      try {
        // Decode the event
        const decodedLog = checkInInterface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        if (!decodedLog) {
          throw new Error("Failed to decode event data");
        }

        // Get block timestamp only for new events
        const blockTimestamp = await getBlockTimestamp(log.blockNumber);

        // Create or get user
        const user = await getOrCreateUser(decodedLog.args[0].toLowerCase());
        if (!user) {
          console.error(
            `Failed to create/get user for address ${decodedLog.args[0].toLowerCase()}`,
          );
          continue;
        }

        // Save checkin immediately
        const { error: insertError } = await supabase.from("checkins").insert([
          {
            user_id: user.user_id,
            streak: Number(decodedLog.args[2]),
            count: Number(decodedLog.args[3]),
            hash: log.transactionHash,
            block_number: Number(log.blockNumber),
            block_timestamp: blockTimestamp,
          },
        ]);
        console.log(
          `Inserting checkin for user ${user.user_id}, transaction ${log.transactionHash}, streak ${Number(decodedLog.args[2])}, count ${Number(decodedLog.args[3])}`,
        );

        if (insertError) {
          console.error(
            `Error inserting checkin for transaction ${log.transactionHash}:`,
            insertError,
          );
          continue;
        }

        processedCount++;
        if (processedCount % 10 === 0) {
          console.log(`Processed ${processedCount} events so far...`);
        }
      } catch (error) {
        console.error(`Error processing event ${log.transactionHash}:`, error);
      }
    }

    console.log(`${processedCount} new events processed and inserted`);

    // Log the results
    console.log("Backfill Checkins Results:", {
      totalEvents: allEvents.length,
      existingEvents: existingCheckins.data?.length || 0,
      newEvents: processedCount,
    });

    return new Response(
      JSON.stringify({
        message: "Backfill completed successfully",
        stats: {
          totalEvents: allEvents.length,
          createdEvents: processedCount,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Backfill Checkins Error:", error);
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
