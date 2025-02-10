"use client";

import { CheckInButton } from "@/app/lib/components/CheckInButton";
import { DateTime } from "luxon";
import { useQueryClient } from "@tanstack/react-query";
import { useCheckin } from "@/app/lib/hooks/useCheckin";
import { CheckInGoodies } from "@/app/lib/components/CheckInGoodies";
import { useCheckinEligibility } from "@/app/lib/hooks/useCheckinAbility";
import { useAccount } from "wagmi";
import { useSocialDisplay } from "@/app/lib/hooks/useSocialDisplay";
import { useRevalidateTags } from "@/app/lib/hooks/useRevalidateTags";

export const MyStreak = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { call: revalidateTags } = useRevalidateTags();

  const { data: checkIn } = useCheckin({ address, enabled: true });

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
      // Server
      revalidateTags([`checkIns-${address}`]), // User checkin data
      revalidateTags(["checkins"]), // List of all recent checkins
      // Client
      queryClient.invalidateQueries({ queryKey: ["checkIns", address] }), //User checkin data in hook
      queryClient.invalidateQueries({ queryKey: ["canCheckIn", address] }), // Can checkin hook
    ]).finally(() => {
      show();
    });
  };

  if (checkIn) {
    const lastCheckinTime = DateTime.fromMillis(
      Number(checkIn.lastCheckin) * 1000,
    );
    const nextCheckinTime = lastCheckinTime.plus({ days: 1 });

    if (canChecking) {
      return (
        <div className="flex flex-col gap-2 text-[#677467]">
          {address && (
            <CheckInGoodies streak={checkIn.streak} address={address} />
          )}
          <CheckInButton onSuccess={invalidate} />
        </div>
      );
    } else {
      const comeBackTime = `${lastCheckinTime.toFormat("t")} on ${nextCheckinTime.toFormat("LLL dd")} `;

      return (
        <div className="flex flex-col text-[#677467]">
          {address && (
            <CheckInGoodies streak={checkIn.streak} address={address} />
          )}
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
