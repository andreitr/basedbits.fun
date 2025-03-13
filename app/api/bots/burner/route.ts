import { NextRequest } from "next/server";
import { Contract, JsonRpcProvider, parseUnits, Wallet } from "ethers";
import { BBitsBurnerAbi } from "@/app/lib/abi/BBitsBurner.abi";

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
    const balance = await provider.getBalance(signer.address);
    if (balance < burnAmount) {
      return new Response("Insufficient funds for burn", {
        status: 400,
      });
    }

    const contract = new Contract(
      process.env.NEXT_PUBLIC_BB_BURNER_ADDRESS as string,
      BBitsBurnerAbi,
      signer,
    );

    await contract.burn(burnAmount, {
      value: burnAmount,
    });

    return new Response("Burned", {
      status: 200,
    });
  } catch (error) {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
