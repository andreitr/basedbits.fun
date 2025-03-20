import { readContract } from "@wagmi/core";
import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { BASE_RACE_QKS } from "@/app/lib/constants";
import { BaseRace, IBaseRace } from "@/app/lib/classes/BaseRace";

export const fetchRace = async (race: number): Promise<IBaseRace> => {
  const result: any = await readContract(baseSepoliaConfig, {
    abi: BaseRaceAbi,
    address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
    functionName: "getRace",
    args: [race],
  });

  return BaseRace.fromContractResult(race, result).toJSON();
};

// Avoid duplicate concurrent calls by wrapping the function in a cache
const cachedFetchRace = cache(fetchRace);

// Cache results on the server
export const getRace = (race: number): Promise<IBaseRace> =>
  unstable_cache(
    () => cachedFetchRace(race),
    [`${BASE_RACE_QKS.RACE}-${race}`],
    {
      tags: [`${BASE_RACE_QKS.RACE}-${race}`],
      revalidate: 43_200, //12 hours
    },
  )();
