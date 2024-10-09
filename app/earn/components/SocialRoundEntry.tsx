"use client";

import { useGetSocialRewardsRoundEntry } from "@/app/lib/hooks/useGetSocialRewardsRoundEntry";
import { SocialRewardsRoundEntry } from "@/app/lib/types/types";
import Link from "next/link";
import { AddressToEns } from "@/app/lib/components/client/AddressToEns";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { BBitsSocialRewardsAbi } from "@/app/lib/abi/BBitsSocialRewards.abi";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  roundId: number;
  entryId: number;
  reward: number;
}

export const SocialRoundEntry = ({ roundId, entryId, reward }: Props) => {
  const { isConnected, address } = useAccount();
  const queryClient = useQueryClient();
  const {
    data: entryData,
    isFetched: isFetchedEntry,
    queryKey,
  } = useGetSocialRewardsRoundEntry({
    roundId,
    entryId,
  });

  const { data, writeContract } = useWriteContract();
  const { isFetching: isApproving, isSuccess: isApproved } =
    useWaitForTransactionReceipt({ hash: data });

  const approve = () => {
    writeContract({
      abi: BBitsSocialRewardsAbi,
      address: process.env
        .NEXT_PUBLIC_BB_SOCIAL_REWARDS_ADDRESS as `0x${string}`,
      functionName: "approvePosts",
      args: [[entryId]],
    });
  };

  useEffect(() => {
    if (isApproved) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [isApproved]);

  if (!isFetchedEntry) {
    return <div className="flex flex-row gap-4">{"Loading..."}</div>;
  }

  const entry: SocialRewardsRoundEntry = entryData as SocialRewardsRoundEntry;

  return (
    <div className="flex flex-row text-[#363E36] gap-6 bg-black bg-opacity-10 items-center justify-start rounded-lg px-5 py-2">
      <div className="flex flex-col">
        <div className="text-[#677467] text-xs  uppercase">entry by</div>
        <Link href={`/users/${entry.user}`}>
          <AddressToEns address={entry.user} />
        </Link>
      </div>

      <div className="flex flex-col">
        <div className="text-[#677467] text-xs uppercase">proof of shill</div>
        <div className="w-[280px] overflow-hidden whitespace-nowrap overflow-ellipsis">
          {entry.approved ? (
            <Link
              className="hover:no-underline underline text-[#0000FF]"
              title={entry.post}
              href={entry.post}
            >
              {entry.post}
            </Link>
          ) : (
            <div className="text-[#677467]">{entry.post}</div>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="text-[#677467] text-xs  uppercase">status</div>
        <div>{entry.approved ? "Earning" : "Awaiting approval"}</div>
      </div>

      {!entry.approved &&
        isConnected &&
        address?.toLowerCase() ===
          "0x1d671d1B191323A38490972D58354971E5c1cd2A".toLowerCase() && (
          <div className="flex flex-col">
            <div onClick={approve}> Approve</div>
          </div>
        )}
    </div>
  );
};
