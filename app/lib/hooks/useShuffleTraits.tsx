import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BurnedBitsABI } from "@/app/lib/abi/BurnedBits.abi";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useShuffleTraits = () => {
  const queryClient = useQueryClient();
  const { data, writeContract, writeContractAsync } = useWriteContract();

  const { isFetching, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: data,
  });
  const [isClearingMeta, setIsClearingMeta] = useState(false);
  const [tokenId, setTokenId] = useState();

  useEffect(() => {
    if (isSuccess && data && !isClearingMeta) {
      setIsClearingMeta(true);

      fetch(
        `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/invalidateContract?contractAddress=${process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS}`,
      )
        .then((res) => {
          console.log("refreshed nft metadata");
          // queryClient.invalidateQueries({queryKey()});
        })
        .finally(() => {
          console.log("done clearing meta");
          setIsClearingMeta(false);
        });
    }
  }, [isSuccess, isClearingMeta, tokenId]);

  const write = (id: string) => {
    setTokenId(id as any);
    writeContract({
      abi: BurnedBitsABI,
      address: process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS as `0x${string}`,
      functionName: "setArt",
      args: [[id]],
    });
  };

  return { write, isFetching, isSuccess, isError };
};
