import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { getCheckins } from "@/app/lib/api/getCheckins";
import { postToFarcaster } from "@/app/lib/external/farcaster";
import { baseProvider } from "@/app/lib/Web3Configs";
import { Contract, parseUnits, Wallet } from "ethers";
import { NextRequest } from "next/server";
import { isAddress } from "viem";

const DAILY_AIRDROP_AMOUNT = 200;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const checkins = await getCheckins(86_400); // 24 hours

    if (checkins.length === 0) {
      return new Response("No recent check-ins found", { status: 200 });
    }

    const reward = DAILY_AIRDROP_AMOUNT / checkins.length;
    const rewardAmount = parseUnits(reward.toString(), 18);

    const signer = new Wallet(
      process.env.AIRDROP_BOT_PK as string,
      baseProvider,
    );

    const contract = new Contract(
      process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as string,
      BBitsTokenAbi,
      signer,
    );

    let nonce = await baseProvider.getTransactionCount(signer.address);
    let successfulTransfers = 0;

    for (const checkin of checkins) {
      if (isAddress(checkin.user.address)) {
        try {
          await contract.transfer(checkin.user.address, rewardAmount, {
            nonce: nonce++,
          });
          successfulTransfers++;
        } catch (error) {
          console.error("Failed to transfer to", checkin, "Error:", error);
        }
      } else {
        console.log("Invalid address:", checkin.user.address);
      }
    }

    // Post to Farcaster if there were any successful transfers
    if (successfulTransfers > 0) {
      const message = `Daily BBITS Airdrop sent!\n\n${successfulTransfers} based frens received ${reward.toFixed(2)} $BBITS each for checking in. Start your streak today! https://www.basedbits.fun`;
      await postToFarcaster(message);
    }

    return new Response("Daily airdrop sent", {
      status: 200,
    });
  } catch (error) {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
