import { baseConfig } from "@/app/lib/Web3Configs";
import { BBitsCheckInABI } from "@/app/lib/abi/BBitsCheckIn.abi";
import { CheckIn } from "@/app/lib/types/types";
import { readContract } from "@wagmi/core";
import { unstable_cache } from "next/cache";
import { cache } from "react";

// Read contract data
export const getCheckin = async (address: string) => {
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
