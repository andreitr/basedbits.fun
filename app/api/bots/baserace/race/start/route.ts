import { fetchRace } from "@/app/lib/api/baserace/getRace";
import { fetchRaceCount, getRaceCount } from "@/app/lib/api/baserace/getRaceCount";
import { BASE_RACE_QKS, BASE_RACE_STATUS } from "@/app/lib/constants";
import { getBaseRaceBotContract } from "@/app/lib/contracts/baserace";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { fetchLap } from "@/app/lib/api/baserace/getLap";
import { fetchLapTime } from "@/app/lib/api/baserace/getLapTime";
import { DateTime } from "luxon";

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

    const currentRaceId = await fetchRaceCount();
    const previousRaceId = currentRaceId - 1;
    const status = await contract.status();

    console.log("STATUS ", status);
    console.log("currentRace ", currentRaceId);

    if (status === BASE_RACE_STATUS.RACING) {


      const race = await fetchRace(currentRaceId);
      console.log("RACE STATUS ", status);

      if (
        race.lapCount >= race.lapTotal &&
        status === BASE_RACE_STATUS.RACING
      ) {

        console.log("RACE LAP COUNT ", race.lapCount);
        console.log("RACE LAP TOTAL ", race.lapTotal);


        const currentTime = DateTime.now().toSeconds();
        const lap = await fetchLap(currentRaceId, race.lapCount);
        const lapTime = await fetchLapTime();

        if (currentTime - lap.startedAt >= lapTime) {
          console.log("Finishing current game...");
          const finishTx = await contract.finishGame();
          await finishTx.wait();
          console.log("Game finished successfully");

          // Verify the game is actually finished
          const statusAfterFinish = await contract.status();
          if (statusAfterFinish === BASE_RACE_STATUS.PENDING) {
            console.log("Starting new game...");
            const startTx = await contract.startGame();
            await startTx.wait();
            console.log("New game started successfully");
          } else {
            console.log(`Unable to start new game. Status after finish: ${statusAfterFinish}`);
          }
        } else {
          console.log("Unable to finish the game. Lap time not reached.");
        }
      }
    }

    // Remove the separate status check since we handle it above
    if (status === BASE_RACE_STATUS.PENDING) {
      console.log("No ongoing race, starting new game...");
      const startTx = await contract.startGame();
      await startTx.wait();
      console.log("New game started successfully");
    }

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
