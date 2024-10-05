import { BBitsSocialRewardsAbi } from "@/app/lib/abi/BBitsSocialRewards.abi";
import { useReadContract } from "wagmi";

interface Props {
  roundId: number;
  entryId: number;
}

export const useGetSocialRewardsRoundEntry = ({ roundId, entryId }: Props) => {
  return useReadContract({
    abi: BBitsSocialRewardsAbi,
    address: process.env.NEXT_PUBLIC_BB_SOCIAL_REWARDS_ADDRESS as `0x${string}`,
    functionName: "getEntryInfoForId",
    args: [roundId, entryId],
  });
};
