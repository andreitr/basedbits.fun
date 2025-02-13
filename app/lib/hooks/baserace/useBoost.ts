import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";

interface Props {
  tokenId: string;
}

export const useBoost = ({ tokenId }: Props) => {
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess, isError, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const call = () => {
    writeContract({
      abi: BaseRaceAbi,
      address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
      functionName: "boost",
      args: [tokenId],
    });
  };

  return { call, isFetching, isSuccess, isError, error };
};
