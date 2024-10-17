"use client";

import { useGetSocialRewardsRoundEntry } from "@/app/lib/hooks/useGetSocialRewardsRoundEntry";
import { SocialRewardsRoundEntry } from "@/app/lib/types/types";
import Link from "next/link";
import { AddressToEns } from "@/app/lib/components/client/AddressToEns";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BBitsSocialRewardsAbi } from "@/app/lib/abi/BBitsSocialRewards.abi";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetSocialRewardsAdmin } from "@/app/lib/hooks/useGetSocialRewardsAdmin";

interface Props {
  roundId: number;
  entryId: number;
  reward: number;
}

export const SocialRoundEntry = ({ roundId, entryId, reward }: Props) => {
  const queryClient = useQueryClient();
  const {
    data: entryData,
    isFetched: isFetchedEntry,
    queryKey,
  } = useGetSocialRewardsRoundEntry({
    roundId,
    entryId,
  });

  const { data: canApprove } = useGetSocialRewardsAdmin();

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
    <div className="flex sm:flex-row flex-col text-[#363E36] sm:gap-10 gap-2 bg-black bg-opacity-10 w-full rounded-lg px-5 py-2">
      <div className="flex flex-col">
        <div className="text-[#677467] text-xs  uppercase">by</div>
        <Link href={`/users/${entry.user}`}>
          <AddressToEns address={entry.user} />
        </Link>
      </div>

      <div className="flex flex-col justify-between">
        <div className="text-[#677467] text-xs uppercase">social post</div>
        <div className="whitespace-nowrap overflow-x-hidden">
          {entry.approved ? (
            <Link
              className="hover:no-underline underline text-[#0000FF]"
              title={entry.post}
              href={entry.post}
              target="_blank"
            >
              {entry.post}
            </Link>
          ) : (
            <div className="text-[#677467]">{entry.post}</div>
          )}
        </div>
      </div>
      <div className="flex flex-row w-full justify-end">
        {!entry.approved && (
          <>
            {canApprove ? (
              <div className="flex flex-col float-right">
                <div className="text-[#677467] text-xs uppercase">
                  admin only
                </div>
                <div className="cursor-pointer" onClick={approve}>
                  {"Approve"}
                </div>
              </div>
            ) : (
              <div className="flex flex-col float-right">
                <div className="text-[#677467] text-xs uppercase">status</div>
                <div>{"In Review"}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
