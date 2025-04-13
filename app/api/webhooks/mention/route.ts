import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        // Get the request headers
        const headersList = await headers();
        const signature = headersList.get("x-neynar-signature");

        if (!signature) {
            return NextResponse.json(
                { success: false, error: "Missing signature" },
                { status: 401 },
            );
        }

        // Get the raw body for signature verification
        const rawBody = await request.text();
        const body = JSON.parse(rawBody);

        // Verify the signature
        const webhookSecret = process.env.NEYNAR_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("NEYNAR_WEBHOOK_SECRET is not set");
            return NextResponse.json(
                { success: false, error: "Server configuration error" },
                { status: 500 },
            );
        }

        // Create HMAC with SHA256 using the webhook secret
        const hmac = crypto.createHmac("sha256", webhookSecret);
        // Update HMAC with the raw request body exactly as received
        hmac.update(rawBody, "utf8");
        // Get the hex digest
        const calculatedSignature = hmac.digest("hex");

        // Compare the signatures
        if (signature !== calculatedSignature) {
            console.error("Invalid signature", {
                received: signature,
                calculated: calculatedSignature,
                rawBody: rawBody,
                webhookSecret: webhookSecret.substring(0, 4) + "...", // Only log first 4 chars for security
            });
            return NextResponse.json(
                { success: false, error: "Invalid signature" },
                { status: 401 },
            );
        }

        // Extract relevant data from the mention
        const castId = body?.data?.hash;
        const userWallet = body?.data?.author?.custody_address;
        const text = body?.data?.text;
        const author = {
            fid: body?.data?.author?.fid,
            username: body?.data?.author?.username,
            displayName: body?.data?.author?.display_name,
        };

        console.log("Received Neynar mention webhook:", {
            timestamp: new Date().toISOString(),
            signature,
            castId,
            userWallet,
            text,
            author,
            // Log full body for debugging
            fullBody: body,
        });

        return NextResponse.json(
            { success: true, message: "Webhook received" },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error processing Neynar mention webhook:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
