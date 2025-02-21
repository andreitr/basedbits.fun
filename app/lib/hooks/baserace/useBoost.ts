import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";

export const useBoost = () => {
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess, isError, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const call = (tokenId: string) => {
    writeContract({
      abi: BaseRaceAbi,
      address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
      functionName: "boost",
      args: [tokenId],
    });
  };

  return { call, data, isFetching, isSuccess, isError, error };
};
