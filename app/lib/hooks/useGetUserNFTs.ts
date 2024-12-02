import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { type AlchemyUserResponse } from "@/app/lib/types/alchemy";

interface Props {
  address: string | undefined;
  contract: string;
  pageKey?: string;
  size?: number;
}

export const useGetUserNFTs = ({ address, contract, pageKey, size }: Props) => {
  return useQuery({
    queryKey: ["getNFTsForOwner", contract, address, pageKey],
    queryFn: async (): Promise<AlchemyUserResponse> => {
      const response = await fetch(
        `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/getNFTsForOwner?owner=${address}&contractAddresses%5B%5D=${contract}&withMetadata=true&pageSize=${size}&pageKey=${pageKey}`,
      );
      return await response.json();
    },
    placeholderData: keepPreviousData,
    enabled: !!address,
  });
};
