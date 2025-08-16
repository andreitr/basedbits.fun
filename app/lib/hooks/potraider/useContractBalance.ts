import { useBalance } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

interface UseContractBalanceOptions {
  address?: `0x${string}`;
  chainId?: number;
  enabled?: boolean;
}

export const useContractBalance = (options: UseContractBalanceOptions = {}) => {
  const { address, chainId, enabled = true } = options;
  const queryClient = useQueryClient();

  const { data, isFetched, isError, isLoading, queryKey } = useBalance({
    address:
      address || (process.env.NEXT_PUBLIC_RAIDER_ADDRESS as `0x${string}`),
    chainId,
    query: {
      staleTime: 3600000, // 1 hour
      enabled: enabled && !!address,
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    data: data?.value,
    isFetched,
    isError,
    isLoading,
    invalidate,
  };
};
