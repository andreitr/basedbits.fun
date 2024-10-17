import { BBitsSocialRewardsAbi } from "@/app/lib/abi/BBitsSocialRewards.abi";
import { useAccount, useReadContract } from "wagmi";

export const useGetSocialRewardsAdmin = () => {
  const { isConnected, address } = useAccount();

  return useReadContract({
    abi: BBitsSocialRewardsAbi,
    address: process.env.NEXT_PUBLIC_BB_SOCIAL_REWARDS_ADDRESS as `0x${string}`,
    functionName: "hasRole",
    args: [
      "0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42",
      address,
    ],
    query: {
      enabled: isConnected,
    },
  });
};
