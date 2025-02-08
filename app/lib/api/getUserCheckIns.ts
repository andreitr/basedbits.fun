import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { CheckIn } from "@/app/lib/types/types";
import { BBitsCheckInABI } from "@/app/lib/abi/BBitsCheckIn.abi";
import BigNumber from "bignumber.js";

export async function getUserCheckIns(address: string) {
  try {
    const data: any = await readContract(baseConfig, {
      abi: BBitsCheckInABI,
      address: process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS as `0x${string}`,
      functionName: "checkIns",
      args: [address],
    });

    return {
      lastCheckin: data[0],
      streak: data[1],
      count: data[2],
    } as CheckIn;
  } catch (error) {
    return {
      lastCheckin: BigNumber(0),
      streak: 0,
      count: 0,
    } as CheckIn;
  }
}
