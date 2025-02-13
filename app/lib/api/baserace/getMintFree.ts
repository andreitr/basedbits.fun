import { readContract } from "@wagmi/core";
import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { BASE_RACE_QKS } from "@/app/lib/constants";

export const fetchMintFee = async () => {
  const result: any = await readContract(baseSepoliaConfig, {
    abi: BaseRaceAbi,
    address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
    functionName: "mintFee",
  });
  return result.toString();
};

// Avoid duplicate concurrent calls by wrapping the function in a cache
const cachedFetchMintFee = cache(fetchMintFee);

// Cache results on the server
export const getMintFee = () =>
  unstable_cache(() => cachedFetchMintFee(), [BASE_RACE_QKS.MINT_FEE], {
    tags: [BASE_RACE_QKS.MINT_FEE],
    revalidate: 604_800, //1 week
  })();
