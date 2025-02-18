import { readContract } from "@wagmi/core";
import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { BASE_RACE_QKS } from "@/app/lib/constants";

export const fetchMintTime = async () => {
  const result: any = await readContract(baseSepoliaConfig, {
    abi: BaseRaceAbi,
    address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
    functionName: "mintingTime",
  });
  return Number(result);
};

// Avoid duplicate concurrent calls by wrapping the function in a cache
const cachedFetchMintTime = cache(fetchMintTime);

// Cache results on the server
export const getMintTime = () =>
  unstable_cache(() => cachedFetchMintTime(), [BASE_RACE_QKS.MINT_TIME], {
    tags: [BASE_RACE_QKS.MINT_TIME],
    revalidate: 604_800, //1 week
  })();
