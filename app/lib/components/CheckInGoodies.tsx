"use client";

import { streakToDiscount } from "@/app/lib/utils/numberUtils";
import Link from "next/link";
import { AddressToEns } from "@/app/lib/components/AddressToEns";
import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";
import { CheckIn } from "@/app/lib/types/types";
import { useMessagesForAddress } from "@/app/lib/hooks/messages/useMessagesForAddress";

interface Props {
  checkin: CheckIn;
  address: string;
}

export const CheckInGoodies = ({ checkin, address }: Props) => {
  const [streak, setStreak] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const { data: unclaimedMessages } = useMessagesForAddress({
    address,
    enabled: true,
  });

  useEffect(() => {
    setStreak(checkin.streak);
    setCount(checkin.count);
  }, [checkin]);

  return (
    <div className="flex flex-col gap-3">
      <div className="font-semibold uppercase text-[#363E36]">
        <NumberFlow value={streak} />
        -day streak 🔥 <NumberFlow value={count} />
        {" check-ins"}
      </div>

      <div className="flex flex-col text-black mb-6 bg-white bg-opacity-80 rounded-lg p-4 gap-1">
        {unclaimedMessages?.map((message) => (
          <div key={message.rand_hash}>
            {"• "}
            Check your Farcaster DMs to claim a {message.bounty} BBITS airdrop!
          </div>
        ))}
        <div>
          {"• "}
          <Link
            className="hover:no-underline underline text-[#0000FF]"
            href={`/users/${address}`}
          >
            <AddressToEns address={address as `0x${string}`} />
          </Link>
        </div>
        <div>{"• Receive daily BBITS airdrop"}</div>
        <div>
          {"• "}
          {streakToDiscount(streak)}
          {"% OFF on upcoming mints"}
        </div>
      </div>
    </div>
  );
};
