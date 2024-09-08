"use client";

import { CheckInButton } from "@/app/lib/components/CheckInButton";
import { DateTime } from "luxon";
import Link from "next/link";
import BigNumber from "bignumber.js";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUserCheckIn } from "@/app/lib/hooks/useGetUserCheckIn";
import { streakToDiscount } from "@/app/lib/utils/numberUtils";
import { AddressToEns } from "@/app/lib/components/AddressToEns";
import { CheckInGoodies } from "@/app/lib/components/CheckInGoodies";

interface Props {
  holder: boolean;
  address: string;
}

export const MyStreak = ({ address, holder }: Props) => {
  const queryClient = useQueryClient();

  const {
    data: checkIn,
    queryKey,
    isFetched: isCheckInFetched,
  } = useGetUserCheckIn({ address, enabled: holder });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  if (isCheckInFetched) {
    let [lastCheckin, streak, count] = checkIn as [BigNumber, number, number];

    const lastCheckinTime = DateTime.fromMillis(Number(lastCheckin) * 1000);
    const nextCheckinTime = lastCheckinTime.plus({ days: 1 });
    const now = DateTime.now();
    const hoursSinceLastCheckIn = now.diff(lastCheckinTime, "hours").hours;
    const lastSeen = `${lastCheckinTime.toFormat("LLL dd")} at ${lastCheckinTime.toFormat("t")}`;

    if (hoursSinceLastCheckIn > 24) {
      return (
        <div className="flex flex-col gap-2 text-[#677467]">
          <CheckInGoodies streak={streak} address={address} />

          <CheckInButton onSuccess={invalidate} />
          <div>
            Last seen on{" "}
            <span className="font-semibold test-sm">{lastSeen}</span>. Protect
            your {streak}-day streak!
          </div>
        </div>
      );
    } else {
      const comeBackTime = `${lastCheckinTime.toFormat("t")} on ${nextCheckinTime.toFormat("LLL dd")} `;

      return (
        <div className="flex flex-col gap-2 text-[#677467]">
          <CheckInGoodies streak={streak} address={address} />

          <div>
            Come back after{" "}
            <span className="font-semibold test-sm">{comeBackTime}</span> to
            protect your streak.
          </div>
        </div>
      );
    }
  }
};
