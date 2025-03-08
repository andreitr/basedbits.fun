import { fetchRace } from "@/app/lib/api/baserace/getRace";
import { getRaceCount } from "@/app/lib/api/baserace/getRaceCount";
import { BASE_RACE_QKS, BASE_RACE_STATUS } from "@/app/lib/constants";
import { getBaseRaceBotContract } from "@/app/lib/contracts/baserace";
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

    const contract = getBaseRaceBotContract();

    const currentRaceId = await getRaceCount();
    const previousRaceId = currentRaceId - 1;
    const status = await contract.status();

    if (status === BASE_RACE_STATUS.RACING) {
      const race = await fetchRace(currentRaceId);

      // Only finish if we've completed all laps and the current lap has ended
      if (
        race.lapCount >= race.lapTotal &&
        status === BASE_RACE_STATUS.RACING
      ) {
        const finishTx = await contract.finishGame();
        await finishTx.wait();

        console.log("Finished game....");
      }
    }

    const startTx = await contract.startGame();
    await startTx.wait(); // Wait for transaction confirmation
    console.log("Started new game...");

    revalidateTag(`${BASE_RACE_QKS.RACE}-${previousRaceId}`);
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
