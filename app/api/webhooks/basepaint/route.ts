import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/app/lib/supabase/client";
import { getFarcasterUser } from "@/app/lib/external/farcaster";

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
        };
        sequenceNumber: string;
        network: string;
    };
}

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        const payload = JSON.parse(rawBody) as GraphQLWebhookPayload;

        if (!payload.event?.data?.block?.logs) {
            return NextResponse.json(
                { error: "Invalid webhook payload structure" },
                { status: 400 },
            );
        }

        // Process each log
        for (const log of payload.event.data.block.logs) {
            const senderAddress = log.transaction.from.address.toLowerCase();

            // Get or create user
            const user = await getOrCreateUser(senderAddress);
            if (!user) {
                console.error(`Failed to get/create user for address: ${senderAddress}`);
                continue;
            }

            // If user doesn't have a Farcaster username, try to fetch it
            if (!user.farcaster_name) {
                const fcUser = await getFarcasterUser(senderAddress);
                if (fcUser) {
                    console.log(`Found Farcaster username for ${senderAddress}: @${fcUser.username}`);
                }
            } else {
                console.log(`User ${senderAddress} already has Farcaster username: @${user.farcaster_name}`);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        // Log the full error for debugging
        console.error("Webhook processing error:", {
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