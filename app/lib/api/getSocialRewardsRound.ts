import { BBitsSocialRewardsAbi } from "@/app/lib/abi/BBitsSocialRewards.abi";

import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { SocialRewardsRound } from "@/app/lib/types/types";
import { humanizeNumber } from "@/app/lib/utils/numberUtils";
import { formatUnits } from "ethers";
import BigNumber from "bignumber.js";

interface Props {
  id: number;
}

export async function getSocialRewardsRound({ id }: Props) {
  const data: any = await readContract(baseConfig, {
    abi: BBitsSocialRewardsAbi,
    address: process.env.NEXT_PUBLIC_BB_SOCIAL_REWARDS_ADDRESS as `0x${string}`,
    functionName: "round",
    args: [id],
  });

  const round: SocialRewardsRound = {
    startedAt: BigNumber(data[0]).toNumber(),
    settledAt: BigNumber(data[1]).toNumber(),
    userReward: `${humanizeNumber(Number(formatUnits(data[2])))}`,
    adminReward: `${humanizeNumber(Number(formatUnits(data[3])))}`,
    entriesCount: BigNumber(data[4]).toNumber(),
    rewardedCount: BigNumber(data[5]).toNumber(),
  };

  return round;
}
