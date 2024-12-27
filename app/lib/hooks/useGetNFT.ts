import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlchemyCollectionResponse } from "@/app/lib/types/alchemy";
import { baseNFTUrl } from "@/app/lib/Web3Configs";

interface Props {
  address: string | undefined;
  pageKey?: string;
  size: number;
}

export const useGetNFTs = ({ address, pageKey, size }: Props) => {
  return useQuery({
    queryKey: ["getNFTsForCollection", address, pageKey],
    queryFn: async (): Promise<AlchemyCollectionResponse> => {
      const response = await fetch(
        `${baseNFTUrl}/getNFTsForCollection?contractAddress=${address}&withMetadata=true&pageSize=${size}&pageKey=${pageKey}`,
      );
      return await response.json();
    },
    placeholderData: keepPreviousData,
    enabled: !!address,
  });
};
