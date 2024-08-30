"use client";

import { BBitsCheckInABI } from "@/app/lib/abi/BBitsCheckIn.abi";
import { useAccount, useReadContract } from "wagmi";
import { CheckInButton } from "@/app/lib/components/CheckInButton";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { DateTime } from "luxon";
import Link from "next/link";
import BigNumber from "bignumber.js";
import { useGetUserNFTs } from "@/app/lib/hooks/useGetUserNFTs";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  revalidate: () => void;
}

export const MyStreak = ({ revalidate }: Props) => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { data: userNFTs } = useGetUserNFTs({ address, size: 1 });

  const {
    data: checkIn,
    queryKey,
    isFetched: isCheckInFetched,
  } = useReadContract({
    abi: BBitsCheckInABI,
    address: process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS as `0x${string}`,
    functionName: "checkIns",
    args: [address],
    query: {
      enabled: userNFTs && userNFTs?.totalCount > 0,
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    revalidate();
  };

  if (!isConnected) {
    return <ConnectAction action={"to check-in"} />;
  }

  // NO Based Bits
  if (userNFTs && userNFTs?.totalCount === 0) {
    return (
      <div className="flex flex-col text-[#677467]">
        <div>You need a Based Bit NFT to check in :(</div>
        <div>
          Grab one on{" "}
          <Link
            className="font-semibold hover:underline"
            href="https://opensea.io/collection/based-bits"
            target="_blank"
          >
            OpenSea
          </Link>{" "}
          or try your luck in the raffle!
        </div>
      </div>
    );
  }

  if (isCheckInFetched) {
    let [lastCheckin, streak, count] = checkIn as [BigNumber, number, number];

    const lastCheckinTime = DateTime.fromMillis(Number(lastCheckin) * 1000);
    const nextCheckinTime = lastCheckinTime.plus({ days: 1 });
    const now = DateTime.now();
    const hoursSinceLastCheckIn = now.diff(lastCheckinTime, "hours").hours;

    if (hoursSinceLastCheckIn > 24) {
      return (
        <div className="flex flex-col gap-2 text-[#677467]">
          <CheckInButton onSuccess={invalidate} />
          <div>
            Last seen on{" "}
            <span className="font-semibold test-sm">
              {lastCheckinTime.toFormat("LLL dd")} at{" "}
              {lastCheckinTime.toFormat("t")}
            </span>
            . Protect your {streak}-day streak!
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-2 text-[#677467]">
          <div className="p-4 bg-[#ABBEAC] rounded-lg text-center text-xl font-semibold text-[#363E36]">
            <Link href={`/users/${address}`}>
              {streak}-day streak 🔥 {count} check-in{count === 1 ? "" : "s"}
            </Link>
          </div>
          <div>
            Come back after{" "}
            <span className="font-semibold test-sm">
              {lastCheckinTime.toFormat("t")} on{" "}
              {nextCheckinTime.toFormat("LLL dd")}
            </span>{" "}
            to protect your streak.
          </div>
        </div>
      );
    }
  }
};
