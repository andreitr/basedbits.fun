import { useReadContract } from "wagmi";
import { PotRaiderABI } from "@/app/lib/abi/PotRaider.abi";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  address?: `0x${string}`;
}

export const useBalanceOf = ({ address }: Props) => {
  const queryClient = useQueryClient();

  const { data, isFetched, isError, isLoading, queryKey } = useReadContract({
    abi: PotRaiderABI,
    address: process.env.NEXT_PUBLIC_RAIDER_ADDRESS as `0x${string}`,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 3600000, // 1 hour
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    data,
    isFetched,
    isError,
    isLoading,
    invalidate,
  };
};
