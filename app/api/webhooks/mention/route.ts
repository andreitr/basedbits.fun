import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
    try {
        // Get the raw body
        const rawBody = await request.text();
        const body = JSON.parse(rawBody);

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
