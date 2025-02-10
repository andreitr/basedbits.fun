import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { BBitsCheckInABI } from "@/app/lib/abi/BBitsCheckIn.abi";

export async function getCheckinEligibility(address: string) {
  const data: any = await readContract(baseConfig, {
    abi: BBitsCheckInABI,
    address: process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS as `0x${string}`,
    functionName: "isEligible",
    args: [address],
  });
  return Boolean(data);
}
