import {NextRequest} from "next/server";
import {Contract, JsonRpcProvider, Wallet} from "ethers";
import {baseTestnetRpcUrl} from "@/app/lib/Web3Configs";
import {BaseRaceAbi} from "@/app/lib/abi/BaseRace.abi";
import {DateTime} from "luxon";
import {getRaceCount} from "@/app/lib/api/baserace/getRaceCount";
import {revalidateTag} from "next/cache";
import {BASE_RACE_QKS} from "@/app/lib/constants";
import {fetchRace} from "@/app/lib/api/baserace/getRace";
import {getMintTime} from "@/app/lib/api/baserace/getMintTime";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response("Unauthorized", {
                status: 401,
            });
        }

        revalidateTag(BASE_RACE_QKS.COUNT);
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

        await contract.startNextLap();

        return new Response("Lap Started", {
            status: 200,
        });
    } catch (error) {
        return new Response("Internal Server Error", {
            status: 500,
        });
    }
}
