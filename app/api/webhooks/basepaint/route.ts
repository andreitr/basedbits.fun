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
    console.log("Received webhook request");

    try {
        const rawBody = await request.text();
        console.log("Raw request body:", rawBody);

        const payload = JSON.parse(rawBody) as AlchemyWebhookPayload;
        console.log("Parsed payload:", JSON.stringify(payload, null, 2));

        if (
            !payload.event?.activity ||
            !Array.isArray(payload.event.activity) ||
            payload.event.activity.length === 0
        ) {
            console.log("Invalid payload structure:", {
                hasEvent: !!payload.event,
                hasActivity: !!payload.event?.activity,
                isArray: Array.isArray(payload.event?.activity),
                activityLength: payload.event?.activity?.length
            });
            return NextResponse.json(
                { error: "Invalid webhook payload structure" },
                { status: 400 },
            );
        }

        console.log(`Processing ${payload.event.activity.length} activities`);

        // Process each transfer event
        for (const activity of payload.event.activity) {
            console.log("Processing activity:", {
                category: activity.category,
                from: activity.fromAddress,
                to: activity.toAddress,
                value: activity.value,
                asset: activity.asset
            });

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
            } else {
                console.log("Skipping non-external activity");
            }
        }

        console.log("Successfully processed all activities");
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
            if (error.message.includes("JSON")) {
                console.error("JSON parsing error:", error);
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