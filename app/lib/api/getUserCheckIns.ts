import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { CheckIn } from "@/app/lib/types/types";
import { BBitsCheckInABI } from "@/app/lib/abi/BBitsCheckIn.abi";

export async function getUserCheckIns(address: string) {
  const data: any = await readContract(baseConfig, {
    abi: BBitsCheckInABI,
    address: process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS as `0x${string}`,
    functionName: "checkIns",
    args: [address],
  });

  const checkin: CheckIn = {
    lastCheckin: data[0],
    streak: data[1],
    count: data[2],
  };
  return checkin;
}
