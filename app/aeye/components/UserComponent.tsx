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

  const hasRewards = Boolean(rewards && rewards > BigInt(0));
  console.log(hasRewards, rewards);

  return (
    <div className="flex flex-row items-center justify-between rounded-lg gap-4 ">
      

        {Boolean(streak && streak > BigInt(0)) && (
          <div><span className="font-bold">{"Your Streak: "}</span>{streak || 0}</div>
        )}
        {Boolean(mints && mints > BigInt(0)) && (
          <div><span className="font-bold">{"Mints: "}</span>{mints || 0}</div>
        )}
      
        {rewards && Boolean(rewards && rewards > BigInt(0)) && (
          <div className="flex flex-row items-center gap-2">
            <div><span className="font-bold">{"Rewards: "}</span></div>
            <Button
              className="bg-white text-black"
              onClick={claim}
              loading={isFetching}
            >
              Claim
            </Button>
          </div>
        )}
      </div>

  );
};
