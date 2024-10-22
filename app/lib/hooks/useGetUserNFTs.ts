import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { type AlchemyUserResponse } from "@/app/lib/types/alchemy";

const nftContract = process.env.NEXT_PUBLIC_BB_NFT_ADDRESS;

interface Props {
  address: string | undefined;
  pageKey?: string;
  size: number;
}

export const queryKey = (
  address: string | undefined,
  pageKey: string | undefined,
) => `${address}/nfts?pageKey=${pageKey}`;

export const useGetUserNFTs = ({ address, pageKey, size }: Props) => {
  return useQuery({
    queryKey: [queryKey(address, pageKey)],
    queryFn: async (): Promise<AlchemyUserResponse> => {
      const response = await fetch(
        `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/getNFTsForOwner?owner=${address}&contractAddresses%5B%5D=${nftContract}&withMetadata=true&pageSize=${size}&pageKey=${pageKey}`,
      );
      return await response.json();
    },
    placeholderData: keepPreviousData,
    enabled: !!address,
  });
};
