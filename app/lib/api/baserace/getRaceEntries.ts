import { readContract } from "@wagmi/core";
import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { BASE_RACE_QKS } from "@/app/lib/constants";

export const fetchRaceEntries = async (address: string) => {
  const result: any = await readContract(baseSepoliaConfig, {
    abi: BaseRaceAbi,
    address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
    functionName: "getRaceEntries",
    args: [address],
  });

  return result;
};

// TODO: Fix caching
// Avoid duplicate concurrent calls by wrapping the function in a cache
const cachedFetchRaceEntries = cache(fetchRaceEntries);

// Cache results on the server
export const getRaceEntries = (address: string) =>
  unstable_cache(
    () => cachedFetchRaceEntries(address),
    [`${BASE_RACE_QKS.RACE_ENTRIES}-${address}`],
    {
      tags: [`${BASE_RACE_QKS.RACE_ENTRIES}-${address}`],
      revalidate: 60, //1 minute
    },
  )();
