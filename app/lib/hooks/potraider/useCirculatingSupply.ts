import { useReadContract } from "wagmi";
import { PotRaiderABI } from "@/app/lib/abi/PotRaider.abi";
import { useQueryClient } from "@tanstack/react-query";

interface UseCirculatingSupplyOptions {
  enabled?: boolean;
}

export const useCirculatingSupply = (
  options: UseCirculatingSupplyOptions = {},
) => {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const { data, isFetched, isError, isLoading, queryKey } = useReadContract({
    abi: PotRaiderABI,
    address: process.env.NEXT_PUBLIC_RAIDER_ADDRESS as `0x${string}`,
    functionName: "circulatingSupply",
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
