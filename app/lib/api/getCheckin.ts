import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { CheckIn } from "@/app/lib/types/types";
import { BBitsCheckInABI } from "@/app/lib/abi/BBitsCheckIn.abi";
import { unstable_cache } from "next/cache";
import { cache } from "react";

// Read contract data
export const fetchCheckin = async (address: string) => {
  const data: any = await readContract(baseConfig, {
    abi: BBitsCheckInABI,
    address: process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS as `0x${string}`,
    functionName: "checkIns",
    args: [address],
  });

  return {
    lastCheckin: Number(data[0].toString()),
    streak: data[1],
    count: data[2],
  } as CheckIn;
};

// Avoid duplicate concurrent calls by wrapping the function in a cache
const cachedFetchCheckin = cache(fetchCheckin);

// Cache results on the server
export const getCheckin = (address: string) =>
  unstable_cache(() => cachedFetchCheckin(address), [`checkIns-${address}`], {
    tags: [`checkIns-${address}`],
    revalidate: 86_400, //24 hours
  })();
