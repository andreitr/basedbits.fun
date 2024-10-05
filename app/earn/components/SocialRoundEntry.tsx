"use client";

import { useGetSocialRewardsRoundEntry } from "@/app/lib/hooks/useGetSocialRewardsRoundEntry";
import { SocialRewardsRoundEntry } from "@/app/lib/types/types";
import { AddressToEns } from "@/app/lib/components/AddressToEns";
import Link from "next/link";

interface Props {
  roundId: number;
  entryId: number;
}

export const SocialRoundEntry = ({ roundId, entryId }: Props) => {
  const { data, isFetched } = useGetSocialRewardsRoundEntry({
    roundId,
    entryId,
  });

  if (!isFetched) {
    return <div className="flex flex-row gap-4">{"Loading..."}</div>;
  }

  const entry: SocialRewardsRoundEntry = {
    approved: Boolean(data?.approved as any),
    link: data?.post,
    user: data?.user,
    timestamp: data?.timestamp,
  };

  return (
    <div className="flex flex-row gap-4">
      <div>{entry.approved ? "✅" : "❌"}</div>
      <div>
        {entry.approved ? (
          <Link href={entry.link}>{entry.link}</Link>
        ) : (
          entry.link
        )}
      </div>
      <div>
        <Link href={`/users/${entry.user}`}>
          <AddressToEns address={entry.user} />
        </Link>
      </div>
      <div>{entry.timestamp}</div>
    </div>
  );
};
