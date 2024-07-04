import {readContract} from "@wagmi/core";
import {baseConfig} from "@/app/lib/Web3Configs";
import {BBitsRaffleABI} from "@/app/lib/abi/BBitsRaffle.abi";
import type {Raffle} from "@/app/lib/types/types";

export async function getRaffleById(id: number) {
    const data: any = await readContract(baseConfig, {
        abi: BBitsRaffleABI,
        address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
        functionName: "idToRaffle",
        args: [id],
    });

    const raffle: Raffle = {
        startedAt: data[0],
        settledAt: data[1],
        winner: data[2],
        sponsor: {...data[3]},
    };
    return raffle;
}
