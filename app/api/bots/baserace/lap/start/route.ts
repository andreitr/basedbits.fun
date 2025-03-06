import { NextRequest } from "next/server";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { baseTestnetRpcUrl } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";
import { DateTime } from "luxon";
import { getRaceCount } from "@/app/lib/api/baserace/getRaceCount";
import { revalidateTag } from "next/cache";
import { BASE_RACE_QKS } from "@/app/lib/constants";
import { fetchRace } from "@/app/lib/api/baserace/getRace";
import { getMintTime } from "@/app/lib/api/baserace/getMintTime";
import { fetchLap } from "@/app/lib/api/baserace/getLap";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const currentRaceId = await getRaceCount();
    const race = await fetchRace(currentRaceId);
    const mintTime = await getMintTime();

    const isDoneMinting =
      DateTime.now().toSeconds() > race.startedAt + mintTime;

    if (!isDoneMinting || currentRaceId === 0) {
      return new Response("Race Not Started", {
        status: 400,
      });
    }

    const provider = new JsonRpcProvider(baseTestnetRpcUrl);
    const signer = new Wallet(process.env.BACERACE_BOT_PK as string, provider);

    const contract = new Contract(
      process.env.NEXT_PUBLIC_BASERACE_ADDRESS as string,
      BaseRaceAbi,
      signer,
    );

    const status = await contract.status();
    if (race.lapCount === race.lapTotal) {
      if (status === 2) {
        const currentTime = Math.floor(Date.now() / 1000);
        const lapTime = Number((await contract.lapTime()).toString());
        const lap = await fetchLap(currentRaceId, race.lapCount);
        const lapStartedAt = lap.startedAt;
        if (
          race.lapCount === race.lapTotal &&
          currentTime - lapStartedAt >= lapTime
        ) {
          await contract.finishGame();
          revalidateTag(BASE_RACE_QKS.COUNT);
          revalidateTag(`${BASE_RACE_QKS.RACE}-${currentRaceId}`);
          revalidateTag(`${BASE_RACE_QKS.RACE}-${currentRaceId - 1}`);
        }
      }
    } else {
      await contract.startNextLap();
      revalidateTag(`${BASE_RACE_QKS.RACE}-${currentRaceId}`);
      revalidateTag(`${BASE_RACE_QKS.LAP}-${currentRaceId}-${race.lapCount}`);
      revalidateTag(
        `${BASE_RACE_QKS.LAP}-${currentRaceId}-${race.lapCount + 1}`,
      );
    }

    return new Response("Lap Started", {
      status: 200,
    });
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
