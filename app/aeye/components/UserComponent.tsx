"use client";

import { Button } from "@/app/lib/components/Button";
import { UserAvatar } from "@/app/lib/components/client/UserAvatar";
import { UserName } from "@/app/lib/components/client/UserName";
import { AEYE_QKS } from "@/app/lib/constants";
import { useClaimRewards } from "@/app/lib/hooks/aeye/useClaimRewards";
import { useMintingStreak } from "@/app/lib/hooks/aeye/useMintingStreak";
import { useTotalMints } from "@/app/lib/hooks/aeye/useTotalMints";
import { useUnclaimedUserRewards } from "@/app/lib/hooks/aeye/useUnclaimedUserRewards";
import { useUser } from "@/app/lib/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { formatUnits } from "ethers";
import { useEffect } from "react";
import { useAccount } from "wagmi";

export const UserComponent = () => {
  const { address, isConnected } = useAccount();
  const { data: user } = useUser({
    address: address as `0x${string}`,
    enabled: isConnected,
  });
  const { data: streak } = useMintingStreak({
    address: address as `0x${string}`,
    enabled: isConnected,
  });
  const { data: mints } = useTotalMints({
    address: address as `0x${string}`,
    enabled: isConnected,
  });
  const { data: rewards } = useUnclaimedUserRewards({
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

  const hasRewards = rewards && rewards > 0;

  return (
    <div className="flex flex-row items-center justify-between bg-white rounded-lg p-2 w-full">
      <div className="flex flex-row gap-2 items-center">
        <div className="flex rounded-full p-0.5 bg-black bg-opacity-80 w-10 h-10">
          <UserAvatar user={user} size={36} />
        </div>
        <UserName user={user} />
      </div>
      <div className="flex flex-row gap-4 items-center">
        <div className="text-blue-500">Streak {streak || 0}</div>
        <div className="text-blue-500">Total Minted {mints || 0}</div>
        {hasRewards && (
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={claim}
            loading={isFetching}
          >
            {isFetching
              ? "Claiming..."
              : `Claim ${formatUnits(rewards, 18).slice(0, 7)}Ξ`}
          </Button>
        )}
      </div>
    </div>
  );
};
