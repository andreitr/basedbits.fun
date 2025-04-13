import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { baseRpcUrl } from "@/app/lib/Web3Configs";
import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { Contract, JsonRpcProvider, Wallet, parseUnits } from "ethers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const TOKEN_REWARD_AMOUNT = 5;

const PROMPT = `You are a social media agent with a bit of sass. Your job is to analyze the sentiment of each post and respond accordingly. Return a JSON object with the following format: {



  Behavior Rules:
	•	Positive sentiment → Respond enthusiastically and mention that youve sent ${TOKEN_REWARD_AMOUNT} BBITS tokens as a gift. Keep it playful or celebratory.
	•	Neutral or Negative sentiment → Respond with light attitude. For example, say something like:
	•	"If you want me to send you some BBITS, you gotta post something nice."
	•	"No BBITS for that one. Try again with good vibes."
	•	"I reward positivity, not cryptic vibes."

Keep responses short, cheeky, and in-character.

Respond with a JSON object:

{ 
"sentiment": "positive" | "neutral" | "negative", 
"response": "your response here" 
}
`;

// After checks, we can safely assert these are strings
const neynarApiKey = process.env.NEYNAR_API_KEY as string;
const openaiApiKey = process.env.OPENAI_API_KEY as string;
const signerUuid = process.env.FARCASTER_BASEDBITS_UUID as string;
const privateKey = process.env.AIRDROP_BOT_PK as string;

// Initialize Neynar client
const neynarConfig = new Configuration({
  apiKey: neynarApiKey,
});
const neynarClient = new NeynarAPIClient(neynarConfig);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// Initialize BBITS token contract
const provider = new JsonRpcProvider(baseRpcUrl);
const signer = new Wallet(privateKey, provider);
const tokenContract = new Contract(
  process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as string,
  BBitsTokenAbi,
  signer,
);

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
    const ethAddresses =
      body?.data?.author?.verified_addresses?.eth_addresses || [];
    const text = body?.data?.text;

    // Get response from GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4.5-preview",
      messages: [
        { role: "system", content: PROMPT },
        { role: "user", content: text },
      ],
    });

    let gptResponse;
    try {
      gptResponse = JSON.parse(completion.choices[0].message.content || "{}");
    } catch (e) {
      throw new Error("Failed to parse GPT response as JSON");
    }

    if (!gptResponse.response) {
      throw new Error("Invalid GPT response format");
    }

    let responseText = gptResponse.response;
    let transactionHash = "";

    // If sentiment is positive and we have an ETH address, send tokens
    if (gptResponse.sentiment === "positive" && ethAddresses.length > 0) {
      try {
        const amount = parseUnits(TOKEN_REWARD_AMOUNT.toString(), 18); // BBITS tokens with 18 decimals
        const tx = await tokenContract.transfer(ethAddresses[0], amount);
        await tx.wait();
        transactionHash = tx.hash;
        responseText += `\n\nhttps://basescan.org/tx/${transactionHash}`;

        // Post reply to the cast only if token transfer was successful
        await neynarClient.publishCast({
          signerUuid,
          text: responseText,
          parent: castHash,
        });
      } catch (error) {
        // If token transfer fails, just return success without posting
        return NextResponse.json(
          {
            success: true,
            message: "Webhook received but token transfer failed",
          },
          { status: 200 },
        );
      }
    } else {
      // Post reply for non-positive sentiment or no ETH address
      await neynarClient.publishCast({
        signerUuid,
        text: responseText,
        parent: castHash,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Webhook received and processed",
        transactionHash,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
