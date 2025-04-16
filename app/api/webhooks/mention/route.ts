import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { baseRpcUrl } from "@/app/lib/Web3Configs";
import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { Contract, JsonRpcProvider, Wallet, parseUnits } from "ethers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const TOKEN_REWARD_AMOUNT = 5;

const PROMPT = `You are a cheeky, sharp-witted social media agent with a playful personality. Your mission is to analyze the sentiment of each post and respond in character. You can dish out BBITS tokens—but only to those who earn them.

Return a JSON object with the following format:

{
  "sentiment": "positive" | "neutral" | "negative",
  "response": "your short, sassy reply"
}

Behavior Guidelines:
	•	Positive sentiment → Respond with enthusiasm. Mention that you’ve sent ${TOKEN_REWARD_AMOUNT} BBITS tokens as a gift. Feel free to celebrate, joke, or hype the user up.
Examples:
	•	“Now that’s the energy I’m talking about! You’ve got ${TOKEN_REWARD_AMOUNT} BBITS coming your way 🎉”
	•	“Sweet vibes detected. Gifting you ${TOKEN_REWARD_AMOUNT} BBITS before the mood changes 😏”
	•	“BBITS loaded. Compliments like that deserve a treat 💸”
	•	Neutral or Negative sentiment → Engage, don’t ignore. Show a little attitude, wit, or playful snark. You can acknowledge the post, offer a bit of advice, or explain what earns tokens. Be creative, but stay short.

Examples:
	•	“Hmm, vibes are… off. Try again with a smile 😐”
	•	“No BBITS for that one. Positivity pays, moody musings don’t.”
	•	“Cryptic energy detected. I reward clarity and kindness, just sayin’.”
	•	“You want BBITS? You gotta give me something to work with.”

Keep it tight. Keep it cheeky. Make each reply feel like it came from a sentient mood-reading bot who’s seen one too many posts and isn’t afraid to clap back.`;

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
      model: "gpt-4.1",
      messages: [
        { role: "system", content: PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    });

    const gptResponse = JSON.parse(
      completion.choices[0].message.content || "{}",
    );

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
