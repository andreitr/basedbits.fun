"use client";

import { AddressToEns } from "@/app/lib/components/AddressToEns";
import { CheckIn } from "@/app/lib/types/types";
import NumberFlow from "@number-flow/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/app/lib/hooks/useUser";

interface Props {
  checkin: CheckIn;
  address: string;
}

export const CheckInGoodies = ({ checkin, address }: Props) => {
  const [streak, setStreak] = useState<number>(0);
  const [count, setCount] = useState<number>(0);

  const { data: user } = useUser({
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
        <div>{"• Receive a daily share of Megapot ticket via Pennypot.xyz"}</div>
        {user?.farcaster_name && streak >= 7 && (
          <div>{"• Receive weekly Farcaster airdrop"}</div>
        )}
      </div>
    </div>
  );
};
