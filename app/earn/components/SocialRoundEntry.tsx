"use client";

import { useGetSocialRewardsRoundEntry } from "@/app/lib/hooks/useGetSocialRewardsRoundEntry";
import { SocialRewardsRoundEntry } from "@/app/lib/types/types";
import Link from "next/link";
import { AddressToEnsAvatar } from "@/app/lib/components/client/AddressToEnsAvatar";
import { AddressToEns } from "@/app/lib/components/client/AddressToEns";

interface Props {
  roundId: number;
  entryId: number;
  reward: number;
}

export const SocialRoundEntry = ({ roundId, entryId, reward }: Props) => {
  const { data, isFetched } = useGetSocialRewardsRoundEntry({
    roundId,
    entryId,
  });

  if (!isFetched) {
    return <div className="flex flex-row gap-4">{"Loading..."}</div>;
  }

  const entry: SocialRewardsRoundEntry = data as SocialRewardsRoundEntry;

  return (
    <div className="flex flex-row gap-6 bg-black bg-opacity-10 items-center rounded-lg px-5 py-2">
      <div className="flex flex-col">
        <div className="text-gray-500 text-xs  uppercase">entry by</div>
        <Link href={`/users/${entry.user}`}>
          <AddressToEns address={entry.user} />
        </Link>
      </div>

      <div className="flex flex-col">
        <div className="text-gray-500 text-xs uppercase">proof of shill</div>
        <div className="w-[280px] overflow-hidden whitespace-nowrap overflow-ellipsis">
          {entry.approved ? (
            <Link href={entry.post}>{entry.post}</Link>
          ) : (
            entry.post
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="text-gray-500 text-xs  uppercase">status</div>
        <div>{entry.approved ? "approved" : "pending"}</div>
      </div>

      <div className="flex flex-col">
        <div className="text-gray-500 text-xs  uppercase">rewards</div>
        <div>{entry.approved ? reward : "N/A"}</div>
      </div>
    </div>
  );
};
