"use client";

import { CheckInButton } from "@/app/lib/components/CheckInButton";
import { DateTime } from "luxon";
import Link from "next/link";
import BigNumber from "bignumber.js";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUserCheckIn } from "@/app/lib/hooks/useGetUserCheckIn";
import { streakToDiscount } from "@/app/lib/utils/numberUtils";
import { AddressToEns } from "@/app/lib/components/AddressToEns";

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
          <div className="font-semibold uppercase text-black">
            <AddressToEns address={address as `0x${string}`} />, YOU EARNED
          </div>
          <div className="flex flex-col text-black mb-6 bg-white bg-opacity-80 rounded-lg p-4 gap-1">
            <div>
              • {streakToDiscount(streak)}% mint discount on{" "}
              <Link className="underline text-[#0000FF]" href={`/emojibits`}>
                Emoji Bits
              </Link>{" "}
              mints
            </div>
            <div>
              • Free{" "}
              <Link className="underline text-[#0000FF]" href={`/emojibits`}>
                Daily Raffle
              </Link>{" "}
              entry
            </div>
            {streak > 7 && <div>• Community social posts</div>}
          </div>

          <div className="p-4 bg-[#ABBEAC] rounded-lg text-center text-xl font-semibold text-[#363E36]">
            <Link href={`/users/${address}`}>
              {streak}-day streak 🔥 {count} check-in{count === 1 ? "" : "s"}
            </Link>
          </div>
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
