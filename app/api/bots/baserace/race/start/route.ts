import { baseTestnetRpcUrl } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";
import { getRaceCount } from "@/app/lib/api/baserace/getRaceCount";
import { BASE_RACE_QKS } from "@/app/lib/constants";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { revalidateTag } from "next/cache";
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

    const provider = new JsonRpcProvider(baseTestnetRpcUrl);
    const signer = new Wallet(process.env.BACERACE_BOT_PK as string, provider);

    const contract = new Contract(
      process.env.NEXT_PUBLIC_BASERACE_ADDRESS as string,
      BaseRaceAbi,
      signer,
    );

    const currentRaceId = await getRaceCount();
    revalidateTag(`${BASE_RACE_QKS.RACE}-${currentRaceId}`);
    revalidateTag(BASE_RACE_QKS.COUNT);

    if (currentRaceId > 0) {
      await contract.finishGame();
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
