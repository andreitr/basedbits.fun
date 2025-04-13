import { NextResponse } from "next/server";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import OpenAI from "openai";

const PROMPT = `You are a social media agent with a bit of sass. Your job is to analyze the sentiment of each post and respond accordingly. Return a JSON object with the following format: {

{ "sentiment": "positive" | "neutral" | "negative", "response": "your response here" }

  Behavior Rules:
	•	Positive sentiment → Respond enthusiastically and mention that youve sent 10 BBITS tokens as a gift. Keep it playful or celebratory.
	•	Neutral or Negative sentiment → Respond with light attitude. For example, say something like:
	•	"If you want me to send you some BBITS, you gotta post something nice."
	•	"No BBITS for that one. Try again with good vibes."
	•	"I reward positivity, not cryptic vibes."

Keep responses short, cheeky, and in-character.
`;

// Check required environment variables
if (!process.env.NEYNAR_API_KEY) {
    throw new Error("NEYNAR_API_KEY is not set");
}
if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
}
if (!process.env.NEYNAR_SIGNER_UUID) {
    throw new Error("NEYNAR_SIGNER_UUID is not set");
}

// After checks, we can safely assert these are strings
const neynarApiKey = process.env.NEYNAR_API_KEY as string;
const openaiApiKey = process.env.OPENAI_API_KEY as string;
const signerUuid = process.env.NEYNAR_SIGNER_UUID as string;

// Initialize Neynar client
const neynarConfig = new Configuration({
    apiKey: neynarApiKey,
});
const neynarClient = new NeynarAPIClient(neynarConfig);

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: openaiApiKey,
});

interface GPTResponse {
    sentiment: "positive" | "neutral" | "negative";
    response: string;
}

export async function POST(request: Request) {
    try {
        // Get the raw body
        const rawBody = await request.text();
        const body = JSON.parse(rawBody);

        // Extract relevant data from the mention
        const castId = body?.data?.hash;
        if (!castId) {
            throw new Error("No cast ID found in webhook payload");
        }
        const castHash = castId as string;
        const ethAddresses = body?.data?.author?.verified_addresses?.eth_addresses || [];
        const text = body?.data?.text;
        const author = {
            fid: body?.data?.author?.fid,
            username: body?.data?.author?.username,
            displayName: body?.data?.author?.display_name,
        };

        console.log("Received Neynar mention webhook:", {
            timestamp: new Date().toISOString(),
            castId: castHash,
            ethAddresses,
            text,
            author,
            // Log full body for debugging
            fullBody: body,
        });

        // Get response from GPT-4
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: PROMPT },
                { role: "user", content: text }
            ],
            response_format: { type: "json_object" }
        });

        const gptResponse = JSON.parse(completion.choices[0].message.content || "{}") as GPTResponse;
        console.log("GPT Response:", gptResponse);

        if (!gptResponse.response) {
            throw new Error("Invalid GPT response format");
        }

        // Post reply to the cast
        await neynarClient.publishCast({
            signerUuid,
            text: gptResponse.response,
            parent: castHash,
        });

        return NextResponse.json(
            { success: true, message: "Webhook received and processed" },
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
