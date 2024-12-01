import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BurnedBitsABI } from "@/app/lib/abi/BurnedBits.abi";
import { useEffect, useState } from "react";

export const useShuffleTraits = () => {
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: data,
  });

  const [isClearingMeta, setIsClearingMeta] = useState(false);

  useEffect(() => {
    if (isSuccess && !isClearingMeta) {
      setIsClearingMeta(true);
      fetch(
        `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/invalidateContract?contractAddress=${process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS}`,
      ).then(() => {
        console.log("invalidateContract called");
      });
    }
  }, [isSuccess, isClearingMeta]);

  const write = (id: number) => {
    writeContract({
      abi: BurnedBitsABI,
      address: process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS as `0x${string}`,
      functionName: "setArt",
      args: [[id]],
    });
    setIsClearingMeta(false);
  };

  return { write, isFetching, isSuccess, isError };
};
