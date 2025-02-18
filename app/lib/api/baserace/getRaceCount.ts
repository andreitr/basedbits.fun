import { readContract } from "@wagmi/core";
import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { BASE_RACE_QKS } from "@/app/lib/constants";

export const fetchRaceCount = async () => {
  const result: any = await readContract(baseSepoliaConfig, {
    abi: BaseRaceAbi,
    address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
    functionName: "raceCount",
  });
  return Number(result.toString());
};

// Avoid duplicate concurrent calls by wrapping the function in a cache
const cachedFetchRaceCount = cache(fetchRaceCount);

// Cache results on the server
export const getRaceCount = () =>
  unstable_cache(() => cachedFetchRaceCount(), [BASE_RACE_QKS.COUNT], {
    tags: [BASE_RACE_QKS.COUNT],
    revalidate: 43_200, //12 hours
  })();
