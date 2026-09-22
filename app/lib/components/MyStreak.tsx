"use client";

import { CheckInButton } from "@/app/lib/components/CheckInButton";
import { CheckInGoodies } from "@/app/lib/components/CheckInGoodies";
import { useCheckin } from "@/app/lib/hooks/useCheckin";
import { useCheckinAbility } from "@/app/lib/hooks/useCheckinAbility";
import { useCheckinEligibility } from "@/app/lib/hooks/useCheckinEligibility";
import { useHydrateUser } from "@/app/lib/hooks/useHydrateUser";
import { useSocialDisplay } from "@/app/lib/hooks/useSocialDisplay";
import { useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { CHECKIN_QKS } from "@/app/lib/constants";
import { getCheckin } from "@/app/lib/api/getCheckin";
import { CheckIn } from "@/app/lib/types/types";

const SYNC_ATTEMPTS = 10;
const SYNC_INTERVAL_MS = 1500;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The RPC node serving reads can lag the one that confirmed the tx, so poll
// until the contract reports the new check-in before updating the UI.
const waitForCheckin = async (address: string, previousCount: number) => {
  for (let i = 0; i < SYNC_ATTEMPTS; i++) {
    try {
      const checkin = await getCheckin(address);
      if (Number(checkin.count) > previousCount) return checkin;
    } catch (error) {
      console.error("Failed to read check-in", error);
    }
    await sleep(SYNC_INTERVAL_MS);
  }
  return undefined;
};

interface Props {
  address: string;
}

export const MyStreak = ({ address }: Props) => {
  const queryClient = useQueryClient();
  const { call: hydrateUser } = useHydrateUser();
  const { data: isEligible } = useCheckinEligibility({
    address,
    enabled: true,
  });
  const { data: checkIn, isError } = useCheckin({ address, enabled: true });
  const { data: canChecking } = useCheckinAbility({ address, enabled: true });

  const { show } = useSocialDisplay({
    message: "I just checked-in into @basedbits!",
    title: "You are checked-in! Spread the word 🙏",
    url: `https://basedbits.fun/users/${address}`,
  });

  const syncCheckin = async () => {
    const updated = await waitForCheckin(address, Number(checkIn?.count ?? 0));

    if (updated) {
      queryClient.setQueryData<CheckIn>(
        [CHECKIN_QKS.CHECKINS, address],
        updated,
      );
      queryClient.setQueryData(["canCheckIn", address], false);
    } else {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [CHECKIN_QKS.CHECKINS, address],
        }),
        queryClient.invalidateQueries({ queryKey: ["canCheckIn", address] }),
      ]);
    }

    show();

    // Refresh the check-in list (indexed via webhook) and user profile in the
    // background; the webhook may land a few seconds after the tx.
    hydrateUser(address);
    queryClient.invalidateQueries({
      queryKey: [CHECKIN_QKS.CHECKINS],
      exact: true,
    });
    setTimeout(
      () =>
        queryClient.invalidateQueries({
          queryKey: [CHECKIN_QKS.CHECKINS],
          exact: true,
        }),
      5000,
    );
  };

  if (checkIn) {
    const lastCheckinTime = DateTime.fromMillis(
      Number(checkIn.lastCheckin) * 1000,
    );
    const nextCheckinTime = lastCheckinTime.plus({ days: 1 });

    if (canChecking) {
      return (
        <div className="flex flex-col gap-2 text-[#677467]">
          <CheckInGoodies checkin={checkIn} address={address} />
          <CheckInButton onSuccess={syncCheckin} />
        </div>
      );
    } else {
      const comeBackTime = `${lastCheckinTime.toFormat("t")} on ${nextCheckinTime.toFormat("LLL dd")} `;
      return (
        <div className="flex flex-col text-[#677467]">
          <CheckInGoodies checkin={checkIn} address={address} />
          {isEligible ? (
            <div>
              Come back after{" "}
              <span className="font-semibold test-sm">{comeBackTime}</span> to
              protect your streak.
            </div>
          ) : (
            "Mint a Burned Bit and start checking in."
          )}
        </div>
      );
    }
  }

  if (isError) return null;

  return <MyStreakSkeleton />;
};

const MyStreakSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="h-6 w-64 rounded bg-black bg-opacity-10" />
    <div className="h-[72px] rounded-lg bg-white bg-opacity-60 mb-6" />
    <div className="h-[50px] rounded-lg bg-black bg-opacity-10" />
  </div>
);
