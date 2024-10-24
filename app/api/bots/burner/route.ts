export const dynamic = "force-dynamic";

import { Contract, JsonRpcProvider, parseUnits, Wallet } from "ethers";
import { BBitsBurnerAbi } from "@/app/lib/abi/BBitsBurner.abi";

export async function GET(req: Request) {
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

    const signer = new Wallet(
      process.env.NEXT_PUBLIC_BURNER_BOT_PK as string,
      provider,
    );

    const contract = new Contract(
      process.env.NEXT_PUBLIC_BB_BURNER_ADDRESS as string,
      BBitsBurnerAbi,
      signer,
    );
    const burnAmount = parseUnits("0.0004", 18);

    contract.burn(burnAmount, {
      value: burnAmount,
    });

    return new Response("Burned", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
