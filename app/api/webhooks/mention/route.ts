import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    // Get the request headers
    const headersList = await headers();
    const signature = headersList.get("x-neynar-signature");

    // Log the incoming request for debugging
    const body = await request.json();

    // Extract relevant data from the mention
    const castId = body?.cast?.hash;
    const userWallet = body?.user?.custody_address;

    console.log("Received Neynar mention webhook:", {
      timestamp: new Date().toISOString(),
      signature,
      castId,
      userWallet,
      // Log full body for debugging
      fullBody: body,
    });

    // TODO: Add signature verification if needed
    // For now, we'll just log the data

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
