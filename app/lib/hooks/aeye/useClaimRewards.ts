import { AEYEAbi } from "@/app/lib/abi/AEYE.abi";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export const useClaimRewards = () => {
  const { writeContract, data: hash } = useWriteContract();

  const { isFetching, isError, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claim = () => {
    writeContract({
      abi: AEYEAbi,
      address: process.env.NEXT_PUBLIC_AEYE_ADDRESS as `0x${string}`,
      functionName: "claimRewards",
    });
  };

  return { claim, hash, isFetching, isError, isSuccess };
};
