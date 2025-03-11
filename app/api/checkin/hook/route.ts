import { NextResponse } from "next/server";
import {
    getFarcasterUsername,
    postToFarcaster,
    formatCheckInMessage,
} from "@/app/lib/external/farcaster";


interface CheckInEvent {
    sender: string;
    timestamp: number;
    streak: number;
    totalCheckIns: number;
}

export async function POST(request: Request) {
    try {
        const payload = await request.json();

        // Extract the event data
        const eventData = payload.event.activity[0];


        console.log(payload);
        console.log(eventData);

        // Parse the event data
        const checkInEvent: CheckInEvent = {
            sender: eventData.fromAddress,
            timestamp: parseInt(eventData.blockTimestamp),
            streak: parseInt(eventData.extraData.streak),
            totalCheckIns: parseInt(eventData.extraData.totalCheckIns)
        };

        // Look up Farcaster username
        const username = await getFarcasterUsername(checkInEvent.sender);

        // Format and post the message
        const message = formatCheckInMessage(
            checkInEvent.sender,
            username,
            checkInEvent.streak,
        );
        const success = await postToFarcaster(message);

        if (!success) {
            throw new Error('Failed to post to Farcaster');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
} 