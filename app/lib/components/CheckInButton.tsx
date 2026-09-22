"use client";

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BBitsCheckInABI } from "@/app/lib/abi/BBitsCheckIn.abi";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/app/lib/components/Button";

interface CheckInButtonProps {
  // Resolves once the UI reflects the new onchain state.
  onSuccess: () => Promise<void>;
}

export const CheckInButton = ({ onSuccess }: CheckInButtonProps) => {
  const { data: hash, writeContract, isPending, reset } = useWriteContract();
  const { data: receipt, isLoading: isConfirming } =
    useWaitForTransactionReceipt({ hash });
  const [isSyncing, setIsSyncing] = useState(false);
  const handledHash = useRef<string>();

  useEffect(() => {
    if (!receipt || handledHash.current === receipt.transactionHash) return;
    handledHash.current = receipt.transactionHash;

    if (receipt.status !== "success") {
      toast.error("Check-in transaction failed. Please try again.");
      reset();
      return;
    }

    setIsSyncing(true);
    onSuccess().finally(() => setIsSyncing(false));
  }, [receipt]);

  const checkIn = () => {
    writeContract(
      {
        abi: BBitsCheckInABI,
        address: process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS as `0x${string}`,
        functionName: "checkIn",
      },
      {
        onError: (error) => {
          if (!/user rejected|denied/i.test(error.message)) {
            toast.error("Unable to check in. Please try again.");
          }
        },
      },
    );
  };

  const loading = isPending || isConfirming || isSyncing;
  const label = isPending
    ? "Confirm in Wallet..."
    : isConfirming
      ? "Checking In..."
      : isSyncing
        ? "Updating Streak..."
        : "Check In";

  return (
    <Button
      onClick={checkIn}
      loading={loading}
      className={
        loading
          ? "w-full sm:w-full animate-pulse cursor-wait"
          : "w-full sm:w-full"
      }
    >
      {label}
    </Button>
  );
};
