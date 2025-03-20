import { readContract } from "@wagmi/core";
import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";
import { BaseRaceLap } from "@/app/lib/types/types";

export const fetchLap = async (race: number, lap: number) => {
  const result: any = await readContract(baseSepoliaConfig, {
    abi: BaseRaceAbi,
    address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
    functionName: "getLap",
    args: [race, lap],
  });

  return {
    id: lap,
    startedAt: Number(result[0].toString()),
    endedAt: Number(result[1].toString()),
    eliminations: Number(result[2].toString()),
    positions: result[3],
  } as BaseRaceLap;
};
