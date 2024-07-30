"use client";

import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { useState } from "react";
import { getTokenIdAtIndex } from "@/app/lib/api/getTokenIdAtIndex";

interface Props {
  tokenId: string;
}

export const RedeemNFT = ({ tokenId }: Props) => {
  const { data, writeContract } = useWriteContract();
  const [isPreparing, setIsPreparing] = useState(false);
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  const { data: tokenCount } = useReadContract({
    abi: BBitsTokenAbi,
    address: process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
    functionName: "count",
    args: [],
  });

  const post = async () => {
    if (!tokenCount) return;

    for (let i = 0; i < Number(tokenCount); i++) {
      const idAtIndex = await getTokenIdAtIndex(i);

      if (idAtIndex === tokenId) {
        setIsPreparing(false);
        writeContract({
          abi: BBitsTokenAbi,
          address: process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
          functionName: "exchangeTokensForSpecificNFTs",
          args: [BigInt(1024000000000000000000), [i]],
        });
        return;
      }
    }
  };

  if (isSuccess) {
    return <div className="mt-2">Redeemed!</div>;
  }

  if (isPreparing) {
    return (
      <div className="mt-2 text-center">
        <div>Preparing...</div>
        <div className="text-xs">Might take a few</div>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        setIsPreparing(true);
        post();
      }}
      className="mt-2 hover:underline cursor-pointer"
    >
      {isFetching ? "Swapping..." : `REDEEM #${tokenId}`}
    </div>
  );
};
