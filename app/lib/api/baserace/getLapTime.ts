import { readContract } from "@wagmi/core";
import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { BASE_RACE_QKS } from "@/app/lib/constants";

export const fetchLapTime = async () => {
  const result: any = await readContract(baseSepoliaConfig, {
    abi: BaseRaceAbi,
    address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
    functionName: "lapTime",
  });
  return Number(result);
};

// Avoid duplicate concurrent calls by wrapping the function in a cache
const cachedFetchLapTime = cache(fetchLapTime);

// Cache results on the server
export const getLapTime = () =>
  unstable_cache(() => cachedFetchLapTime(), [BASE_RACE_QKS.LAP_TIME], {
    tags: [BASE_RACE_QKS.LAP_TIME],
    revalidate: 604_800, //1 week
  })();
