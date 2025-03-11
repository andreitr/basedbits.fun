import { NextResponse } from "next/server";
import {
    getFarcasterUsername,
    postToFarcaster,
    formatCheckInMessage,
} from "@/app/lib/external/farcaster";

// Based Bits contract address
const BASED_BITS_CONTRACT = '0xcf77e83f9745429d2722641f07edb2fbc96de240';

interface CheckInEvent {
    sender: string;
    timestamp: number;
    streak: number;
    totalCheckIns: number;
}

export async function POST(request: Request) {
    try {
        const payload = await request.json();

        // Verify this is a valid Alchemy webhook payload
        if (!payload.event || payload.event.network !== 'BASE') {
            return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
        }

        // Extract the event data
        const eventData = payload.event.activity[0];
        if (!eventData || eventData.contractAddress.toLowerCase() !== BASED_BITS_CONTRACT.toLowerCase()) {
            return NextResponse.json({ error: 'Invalid contract address' }, { status: 400 });
        }

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