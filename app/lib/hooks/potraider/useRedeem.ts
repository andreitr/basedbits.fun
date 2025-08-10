import { PotRaiderABI } from "@/app/lib/abi/PotRaider.abi";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export const useRedeem = () => {
  const { writeContract, data: hash } = useWriteContract();

  const { isFetching, isError, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const call = (id: number) => {
    writeContract({
      abi: PotRaiderABI,
      address: process.env.NEXT_PUBLIC_RAIDER_ADDRESS as `0x${string}`,
      functionName: "exchange",
      args: [BigInt(id)],
    });
  };

  return { call, hash, isFetching, isError, isSuccess };
};
