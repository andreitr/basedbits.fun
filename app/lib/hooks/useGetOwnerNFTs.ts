import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchNFTsForOwner } from "@/app/lib/api/getNFTsForOwner";

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
    queryFn: async () =>
      fetchNFTsForOwner({ address, contract, pageKey, size }),
    placeholderData: keepPreviousData,
    enabled: !!address,
    staleTime: 3600000, // 1 hour
  });
};
