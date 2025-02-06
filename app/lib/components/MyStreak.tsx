"use client";

import { CheckInButton } from "@/app/lib/components/CheckInButton";
import { DateTime } from "luxon";
import BigNumber from "bignumber.js";
import { useQueryClient } from "@tanstack/react-query";
import { useCheckin } from "@/app/lib/hooks/useCheckin";
import { CheckInGoodies } from "@/app/lib/components/CheckInGoodies";
import { useCheckinEligibility } from "@/app/lib/hooks/useCheckinAbility";
import { useAccount } from "wagmi";
import { useSocialDisplay } from "@/app/lib/hooks/useSocialDisplay";

export const MyStreak = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { data: checkIn, queryKey } = useCheckin({ address, enabled: true });
  const { data: canChecking } = useCheckinEligibility({
    address,
    enabled: true,
  });

  const { show } = useSocialDisplay({
    message: "I just checked-in into Based Bits!",
    title: "You are checked-in! Spread the word 🙏",
    url: "https://basedbits.fun",
  });

  const invalidate = () => {
    Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: ["canCheckIn", address] }),
    ]).finally(() => {
      show();
    });
  };

  if (checkIn) {
    let [lastCheckin, streak, count] = checkIn as [BigNumber, number, number];

    const lastCheckinTime = DateTime.fromMillis(Number(lastCheckin) * 1000);
    const nextCheckinTime = lastCheckinTime.plus({ days: 1 });

    if (canChecking) {
      return (
        <div className="flex flex-col gap-2 text-[#677467]">
          {address && <CheckInGoodies streak={streak} address={address} />}
          <CheckInButton onSuccess={invalidate} />
        </div>
      );
    } else {
      const comeBackTime = `${lastCheckinTime.toFormat("t")} on ${nextCheckinTime.toFormat("LLL dd")} `;

      return (
        <div className="flex flex-col text-[#677467]">
          {address && <CheckInGoodies streak={streak} address={address} />}
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
