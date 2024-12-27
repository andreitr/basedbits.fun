import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PunkalotABI } from "@/app/lib/abi/Punkalot.abi";
import { baseNFTUrl } from "@/app/lib/Web3Configs";

export const useShuffleTraits = () => {
  const queryClient = useQueryClient();
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: data,
  });

  const [isClearingMeta, setIsClearingMeta] = useState(false);

  useEffect(() => {
    if (isSuccess && !isClearingMeta) {
      setIsClearingMeta(true);
      fetch(
        `${baseNFTUrl}/invalidateContract?contractAddress=${process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS}`,
      ).then(() => {
        queryClient.invalidateQueries({
          queryKey: [
            "getNFTsForOwner",
            process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "getNFTsForCollection",
            process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS,
          ],
        });
      });
    }
  }, [isSuccess, isClearingMeta]);

  const write = (id: number) => {
    writeContract({
      abi: PunkalotABI,
      address: process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS as `0x${string}`,
      functionName: "setArt",
      args: [[id]],
    });
    setIsClearingMeta(false);
  };

  return { write, isFetching, isSuccess, isError };
};
