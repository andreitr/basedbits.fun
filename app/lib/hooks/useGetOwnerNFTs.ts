import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type AlchemyUserResponse } from "@/app/lib/types/alchemy";
import { baseNFTUrl } from "@/app/lib/Web3Configs";

const CACHE_TIME = 1000 * 60 * 10; // 10 minutes

interface Props {
  address: string | undefined;
  contract: string;
  pageKey?: string;
  size?: number;
}

export const useGetOwnerNFTs = ({
  address,
  contract,
  pageKey,
  size,
}: Props) => {
  return useQuery({
    queryKey: ["getNFTsForOwner", contract, address, pageKey],
    queryFn: async (): Promise<AlchemyUserResponse> => {
      const response = await fetch(
        `${baseNFTUrl}/getNFTsForOwner?owner=${address}&contractAddresses%5B%5D=${contract}&withMetadata=true&pageSize=${size}&pageKey=${pageKey}`,
      );
      return await response.json();
    },
    placeholderData: keepPreviousData,
    enabled: !!address,
    staleTime: CACHE_TIME,
  });
};
