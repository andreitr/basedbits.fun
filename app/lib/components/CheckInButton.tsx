"use client";

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BBitsCheckInABI } from "@/app/lib/abi/BBitsCheckIn.abi";

import { useEffect } from "react";
import { DateTime, Duration, Interval } from "luxon";
import BigNumber from "bignumber.js";

interface CheckInButtonProps {
  onSuccess: () => void;
  time: BigNumber;
}

export const CheckInButton = ({ onSuccess, time }: CheckInButtonProps) => {
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const lastCheckinTime = DateTime.fromMillis(
    BigNumber(time).toNumber() * 1000,
  );
  const elapsedTime = Interval.fromDateTimes(lastCheckinTime, DateTime.now());
  const remainingTime = Duration.fromObject({ hours: 24 }).minus(
    elapsedTime.toDuration("hours"),
  );

  const checkIn = () => {
    writeContract({
      abi: BBitsCheckInABI,
      address: process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS as `0x${string}`,
      functionName: "checkIn",
    });
  };

  return (
    <>
      {remainingTime.toMillis() <= 0 && (
        <button
          onClick={checkIn}
          disabled={isFetching}
          className="bg-[#303730] hover:bg-[#677467] text-[#DDF5DD] py-2 px-4 rounded"
        >
          {isFetching ? "Checking In..." : "Check In"}
        </button>
      )}
    </>
  );
};
