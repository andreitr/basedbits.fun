"use client";

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";

interface Props {
  tokenId: string;
}

export const DepositNFT = ({ tokenId }: Props) => {
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  const post = () => {
    writeContract({
      abi: BBitsTokenAbi,
      address: process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
      functionName: "exchangeNFTsForTokens",
      args: [[tokenId]],
    });
  };

  if (isSuccess) {
    return <div className="mt-2">Deposited!</div>;
  }

  return (
    <div
      onClick={post}
      className="mt-2 flex flex-row justify-center items-center gap-2 hover:underline cursor-pointer"
    >
      {isFetching ? "Swapping..." : `DEPOSIT #${tokenId}`}
    </div>
  );
};
