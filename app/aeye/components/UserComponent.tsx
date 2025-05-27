"use client";

import { AEYE_QKS } from "@/app/lib/constants";
import { useClaimRewards } from "@/app/lib/hooks/aeye/useClaimRewards";
import { useUserMintStreak } from "@/app/lib/hooks/aeye/useUserMintStreak";
import { useUserUnclaimedReward } from "@/app/lib/hooks/aeye/useUserUnclaimedReward";
import { useUser } from "@/app/lib/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { formatUnits } from "ethers";
import Link from "next/link";
import { useEffect } from "react";
import { useAccount } from "wagmi";

export const UserComponent = () => {
  const { address, isConnected } = useAccount();
  const { data: user } = useUser({
    address: address as `0x${string}`,
    enabled: isConnected,
  });
  const { data: streak } = useUserMintStreak({
    address: address as `0x${string}`,
    enabled: isConnected,
  });

  const { data: rewards } = useUserUnclaimedReward({
    address: address as `0x${string}`,
    enabled: isConnected,
  });

  const { claim, hash, isFetching, isSuccess } = useClaimRewards();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isSuccess && hash) {
      queryClient.invalidateQueries({
        queryKey: [AEYE_QKS.USER_REWARDS, address],
      });
    }
  }, [isSuccess, hash, queryClient, address]);

  if (!user) {
    return null;
  }

  const hasRewards = Boolean(rewards && rewards > BigInt(0));
  console.log(streak);

  return (
    <div className="flex flex-row items-center justify-between rounded-lg gap-2 uppercase">
      {Boolean(streak && streak > BigInt(0)) && (
        <div>{streak}-day mint streak</div>
      )}

      <div>🔥</div>

      {hasRewards && rewards && (
        <Link
          href=""
          className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
          onClick={claim}
        >
          Claim {formatUnits(rewards, 18).slice(0, 7)}Ξ
        </Link>
      )}
    </div>
  );
};
