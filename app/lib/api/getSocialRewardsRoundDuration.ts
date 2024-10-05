import { BBitsSocialRewardsAbi } from "@/app/lib/abi/BBitsSocialRewards.abi";

import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";

export async function getSocialRewardsRoundDuration() {
  const data: any = await readContract(baseConfig, {
    abi: BBitsSocialRewardsAbi,
    address: process.env.NEXT_PUBLIC_BB_SOCIAL_REWARDS_ADDRESS as `0x${string}`,
    functionName: "duration",
  });
  return Number(data);
}
