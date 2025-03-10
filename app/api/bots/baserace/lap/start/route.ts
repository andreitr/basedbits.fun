import { fetchMintTime } from "@/app/lib/api/baserace/getMintTime";
import { fetchRace } from "@/app/lib/api/baserace/getRace";
import { fetchRaceCount } from "@/app/lib/api/baserace/getRaceCount";
import { BASE_RACE_QKS } from "@/app/lib/constants";
import { getBaseRaceBotContract } from "@/app/lib/contracts/baserace";
import { DateTime } from "luxon";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { BASE_RACE_STATUS } from "@/app/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const currentRaceId = await fetchRaceCount();
    const race = await fetchRace(currentRaceId);
    const mintTime = await fetchMintTime();

    const isDoneMinting = DateTime.now().toSeconds() > race.startedAt + mintTime;

    if (!isDoneMinting || currentRaceId === 0) {
      return new Response("Race Not Started", {
        status: 400,
      });
    }

    const contract = getBaseRaceBotContract();

    if (race.lapCount === race.lapTotal) {

      const status = await contract.status();

      if (Number(status) === BASE_RACE_STATUS.RACING) {
        try {
          const tx = await contract.finishGame();
          const receipt = await tx.wait();

          revalidateTag(BASE_RACE_QKS.COUNT);
          revalidateTag(`${BASE_RACE_QKS.RACE}-${currentRaceId}`);
          revalidateTag(`${BASE_RACE_QKS.LAP}-${currentRaceId}-${race.lapCount}`);

          return new Response("Game Finished Successfully", {
            status: 200,
          });

        } catch (txError) {
          console.error("Transaction failed:", txError);
          return new Response("Failed to finish game: Transaction error", {
            status: 500,
          });
        }
      }

      return new Response("Unable to finish game. Status is not RACING", {
        status: 400,
      });

    } else {

      const tx = await contract.startNextLap();
      await tx.wait();

      revalidateTag(`${BASE_RACE_QKS.RACE}-${currentRaceId}`);
      revalidateTag(`${BASE_RACE_QKS.LAP}-${currentRaceId}-${race.lapCount}`);

      return new Response("Lap Started", {
        status: 200,
      });
    }

  } catch (error) {
    console.error("Error in lap start:", error);
    if (error instanceof Error) {
      return new Response(`Error: ${error.message}`, {
        status: 500,
      });
    }
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
