import { NextResponse } from "next/server";

interface AlchemyWebhookPayload {
    webhookId: string;
    id: string;
    createdAt: string;
    type: string;
    event: {
        activity: Array<{
            fromAddress: string;
            toAddress: string;
            blockNum: number;
            hash: string;
            value: number;
            asset: string;
            category: string;
            rawContract: {
                value: string;
                address: string;
                decimal: string;
            };
        }>;
        network: string;
    };
}

export async function POST(request: Request) {
    try {
        const payload = (await request.json()) as AlchemyWebhookPayload;

        if (!payload.event?.activity || !Array.isArray(payload.event.activity)) {
            return NextResponse.json(
                { error: "Invalid webhook payload structure" },
                { status: 400 },
            );
        }

        // Process each transfer event
        for (const activity of payload.event.activity) {
            if (activity.category === "external") {
                // Log transfer details
                console.log("Processing transfer:", {
                    from: activity.fromAddress,
                    to: activity.toAddress,
                    value: activity.value,
                    asset: activity.asset,
                    transactionHash: activity.hash,
                    blockNumber: activity.blockNum,
                    contractAddress: activity.rawContract.address,
                    decimals: activity.rawContract.decimal,
                });
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

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
} 