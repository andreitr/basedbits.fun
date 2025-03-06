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
    const previousRaceId = currentRaceId - 1;

    const status = await contract.status();
    if (status === 2) {
      // InRace
      const race = await contract.getRace(currentRaceId);
      const lapCount = Number(race[4].toString()); // lapCount is at index 4
      const lapTotal = Number(race[3].toString()); // lapTotal is at index 3
      const currentLap = await contract.getLap(currentRaceId, lapCount);
      const currentTime = Math.floor(Date.now() / 1000);
      const lapTime = Number((await contract.lapTime()).toString());

      // Only finish if we've completed all laps and the current lap has ended
      if (
        lapCount >= lapTotal &&
        currentTime - Number(currentLap.startedAt.toString()) >= lapTime
      ) {
        const finishTx = await contract.finishGame();
        await finishTx.wait();
      }
    }

    const startTx = await contract.startGame();
    await startTx.wait(); // Wait for transaction confirmation

    // Revalidate after game state changes
    if (previousRaceId >= 0) {
      revalidateTag(`${BASE_RACE_QKS.RACE}-${previousRaceId}`);
    }
    revalidateTag(`${BASE_RACE_QKS.RACE}-${currentRaceId}`);
    revalidateTag(BASE_RACE_QKS.COUNT);

    return new Response("Game Started", {
      status: 200,
    });
  } catch (error) {
    console.error("Error in race management:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
