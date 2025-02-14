"use client";

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BBitsCheckInABI } from "@/app/lib/abi/BBitsCheckIn.abi";

import { useEffect } from "react";
import { Button } from "@/app/lib/components/Button";

interface CheckInButtonProps {
  onSuccess: () => void;
}

export const CheckInButton = ({ onSuccess }: CheckInButtonProps) => {
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
    }
  }, [isSuccess]);

  const checkIn = () => {
    writeContract({
      abi: BBitsCheckInABI,
      address: process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS as `0x${string}`,
      functionName: "checkIn",
    });
  };

  return (
    <Button onClick={checkIn} loading={isFetching} className="w-full sm:w-full">
      {isFetching ? "Checking In..." : "Check In"}
    </Button>
  );
};
