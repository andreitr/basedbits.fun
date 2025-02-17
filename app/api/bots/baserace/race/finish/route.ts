import { NextRequest } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { baseTestnetRpcUrl } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }
    const provider = new JsonRpcProvider(baseTestnetRpcUrl);
    const signer = new Wallet(process.env.BACERACE_BOT_PK as string, provider);

    const contract = new Contract(
      process.env.NEXT_PUBLIC_BASERACE_ADDRESS as string,
      BaseRaceAbi,
      signer,
    );

    await contract.finishGame();

    return new Response("Game Finished", {
      status: 200,
    });
  } catch (error) {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
