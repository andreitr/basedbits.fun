import { useReadContract } from "wagmi";
import { PotRaiderABI } from "@/app/lib/abi/PotRaider.abi";
import { useQueryClient } from "@tanstack/react-query";

interface UseTotalSupplyOptions {
  enabled?: boolean;
}

export const useTotalSupply = (options: UseTotalSupplyOptions = {}) => {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const { data, isFetched, isError, isLoading, queryKey } = useReadContract({
    abi: PotRaiderABI,
    address: process.env.NEXT_PUBLIC_RAIDER_ADDRESS as `0x${string}`,
    functionName: "totalSupply",
    query: {
      staleTime: 3600000, // 1 hour
      enabled, // Use enabled directly
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    data: data as bigint,
    isFetched,
    isError,
    isLoading,
    invalidate,
  };
};
