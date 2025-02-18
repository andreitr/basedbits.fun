import { NextRequest } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { baseTestnetRpcUrl } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";
import { BASE_RACE_QKS } from "@/app/lib/constants";
import { revalidateTag } from "next/cache";
import { getRaceCount } from "@/app/lib/api/baserace/getRaceCount";

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

    const currentRaceId = await getRaceCount();
    revalidateTag(`${BASE_RACE_QKS.RACE}-${currentRaceId}`);

    try {
      await contract.finishGame();
    } catch (error) {
      // Handle the initial game start
      console.log("No game to finish");
    }
    await contract.startGame();

    return new Response("Game Started", {
      status: 200,
    });
  } catch (error) {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
