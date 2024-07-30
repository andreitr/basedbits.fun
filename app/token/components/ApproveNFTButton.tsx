"use client";

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useEffect } from "react";
import Link from "next/link";
import { BBitsNFTABI } from "@/app/lib/abi/BBitsNFT.abi";

interface Props {
  approve: boolean;
  onSuccess?: () => void;
}

export const ApproveNFTButton = ({ approve, onSuccess }: Props) => {
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  const label = approve
    ? "Revoke Transfer Permission"
    : "Grant Transfer Permission";

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const post = () => {
    writeContract({
      abi: BBitsNFTABI,
      address: process.env.NEXT_PUBLIC_BB_NFT_ADDRESS as `0x${string}`,
      functionName: "setApprovalForAll",
      args: [
        process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
        !approve,
      ],
    });
  };

  return (
    <Link href={"#"} onClick={post} className="underline cursor-pointer">
      {isFetching ? "Loading..." : label}
    </Link>
  );
};
