"use client";

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { useEffect } from "react";
import Link from "next/link";

interface Props {
  tokenId: string;
  onSuccess?: () => void;
}

export const DepositNFT = ({ tokenId, onSuccess }: Props) => {
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const post = () => {
    writeContract({
      abi: BBitsTokenAbi,
      address: process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
      functionName: "exchangeNFTsForTokens",
      args: [[tokenId]],
    });
  };

  return (
    <Link
      href={"#"}
      onClick={post}
      className="mt-2 flex flex-row justify-center items-center gap-2 hover:underline cursor-pointer"
    >
      SWAP #{tokenId}
    </Link>
  );
};
