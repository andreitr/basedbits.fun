import { BBitsBurnerAbi } from "@/app/lib/abi/BBitsBurner.abi";
import { getBasePaintRewardsContract } from "@/app/lib/contracts/BasePaintRewards";
import { postToFarcaster } from "@/app/lib/external/farcaster";
import { Contract, formatEther, JsonRpcProvider, parseUnits, Wallet } from "ethers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {

  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const provider = new JsonRpcProvider(
      `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    );

    const signer = new Wallet(process.env.BURNER_BOT_PK as string, provider);
    const burnAmount = parseUnits("0.0004", 18);


    // Check wallet balance before proceeding
    const ethBalance = await provider.getBalance(signer.address);
    if (ethBalance < burnAmount) {

      const bprContract = getBasePaintRewardsContract();
      const bprBalance = await bprContract.balanceOf(signer.address);

      if (bprBalance > 0) {
        await bprContract.cashOut(signer.address);

        return new Response("Cash out successful", {
          status: 200,
        })

      } else {
        return new Response("Insufficient funds for burn", {
          status: 400,
        });
      }


    } else {
      const contract = new Contract(
        process.env.NEXT_PUBLIC_BB_BURNER_ADDRESS as string,
        BBitsBurnerAbi,
        signer,
      );

      const tx = await contract.burn(burnAmount, {
        value: burnAmount,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Format the burn amount for display
      const formattedAmount = formatEther(burnAmount);

      // Create transaction link for Base
      const txLink = `https://basescan.org/tx/${receipt.hash}`;

      // Post to Farcaster
      await postToFarcaster(
        `We just burned ${formattedAmount} ETH worth of BBITS 🔥`,
        txLink
      );

      return new Response("Burned", {
        status: 200,
      })
    }


  } catch (error) {
    return new Response("Internal Server Error", {
      status: 500,
    })
  }
}
