"use client";

import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useEffect } from "react";
import Link from "next/link";
import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";

interface Props {
  address: `0x${string}`;
  approve: boolean;
  onSuccess?: () => void;
}

export const ApproveTokenButton = ({ address, approve, onSuccess }: Props) => {
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  const { data: tokenBalance } = useReadContract({
    abi: BBitsTokenAbi,
    address: process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
    functionName: "balanceOf",
    args: [address],
  });

  const label = approve
    ? "Revoke Spending Permission"
    : "Grant Spending Permission";

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const post = () => {
    writeContract({
      abi: BBitsTokenAbi,
      address: process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
      functionName: "approve",
      args: [
        process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
        approve ? 0 : tokenBalance,
      ],
    });
  };

  return (
    <Link href={"#"} onClick={post} className="underline cursor-pointer">
      {isFetching ? "Loading..." : label}
    </Link>
  );
};
