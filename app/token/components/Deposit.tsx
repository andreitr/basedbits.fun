"use client";

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BBitsTokenABI } from "@/app/lib/abi/BBitsTokenABI";

export const Deposit = () => {
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  console.log(data);

  // useEffect(() => {
  //     if (isSuccess && onSuccess) {
  //         onSuccess();
  //     }
  // }, [isSuccess, onSuccess]);

  const post = () => {
    writeContract({
      abi: BBitsTokenABI,
      address: process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
      functionName: "exchangeNFTsForTokens",
      args: [6489],
    });
  };

  return (
    <button
      onClick={post}
      disabled={isFetching}
      className={
        "bg-[#303730] hover:bg-[#677467] text-[#DDF5DD] py-2 px-4 rounded"
      }
    >
      {isFetching ? "Loading...." : "Deposit Based Bits"}
    </button>
  );
};
