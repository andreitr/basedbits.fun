"use client";

import { CheckInButton } from "@/app/lib/components/CheckInButton";
import { DateTime } from "luxon";
import BigNumber from "bignumber.js";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUserCheckIn } from "@/app/lib/hooks/useGetUserCheckIn";
import { CheckInGoodies } from "@/app/lib/components/CheckInGoodies";
import toast from "react-hot-toast";
import Image from "next/image";
import CloseIcon from "@/app/lib/icons/x-mark.svg";
import Link from "next/link";
import FarcasterIcon from "@/app/lib/icons/farcaster.svg";
import XIcon from "@/app/lib/icons/x.svg";

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
    socialDisplay();
  };

  const socialDisplay = () => {
    const encodedText = encodeURIComponent(
      "I just checked-in into Based Bits!",
    );

    toast.custom(
      (t) => (
        <div className="max-w-md w-full bg-black bg-opacity-80 rounded-lg pointer-events-auto ring-1 ring-black text-white p-5">
          <div className="flex flex-col justify-end gap-5">
            <div className="flex flex-row justify-between items-start">
              <div>You are checked-in! Spread the word 🙏</div>
              <button onClick={() => toast.dismiss(t.id)}>
                <Image src={CloseIcon} alt="Close" width={40} height={40} />
              </button>
            </div>
            <div className="flex flex-row mt-6 gap-6 justify-center">
              <Link
                className="flex flex-row rounded-md border-white border px-3 py-2 w-full justify-center items-center"
                href={`https://warpcast.com/~/compose?text=${encodedText}&&embeds[]=https://basedbits.fun/users/${address}`}
                target="_blank"
              >
                Share on{" "}
                <Image
                  className="ml-3"
                  src={FarcasterIcon}
                  width={16}
                  height={16}
                  alt="Share on Farcaster"
                />
              </Link>
              <Link
                className="flex flex-row rounded-md border-white border px-3 py-2 w-full justify-center items-center"
                href={`https://x.com/intent/post?text=${encodedText}&&url=https://basedbits.fun/users/${address}`}
                target="_blank"
              >
                Share on{" "}
                <Image
                  className="ml-3"
                  src={XIcon}
                  width={16}
                  height={16}
                  alt="Share on X"
                />
              </Link>
            </div>
          </div>
        </div>
      ),
      {
        duration: 50000,
        position: "bottom-right",
      },
    );
  };

  if (isCheckInFetched) {
    let [lastCheckin, streak, count] = checkIn as [BigNumber, number, number];

    const lastCheckinTime = DateTime.fromMillis(Number(lastCheckin) * 1000);
    const nextCheckinTime = lastCheckinTime.plus({ days: 1 });
    const now = DateTime.now();
    const hoursSinceLastCheckIn = now.diff(lastCheckinTime, "hours").hours;

    if (hoursSinceLastCheckIn > 24) {
      return (
        <div className="flex flex-col gap-2 text-[#677467]">
          <CheckInGoodies streak={streak} address={address} />
          <CheckInButton onSuccess={invalidate} />
        </div>
      );
    } else {
      const comeBackTime = `${lastCheckinTime.toFormat("t")} on ${nextCheckinTime.toFormat("LLL dd")} `;

      return (
        <div className="flex flex-col text-[#677467]">
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
