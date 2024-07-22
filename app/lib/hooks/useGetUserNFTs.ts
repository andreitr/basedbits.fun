import { AlchemyResponse } from "@/app/lib/api/getUserNFTs";
import { useQuery } from "@tanstack/react-query";

const nftContract = process.env.NEXT_PUBLIC_BB_NFT_ADDRESS;

interface Props {
  address: string | undefined;
  size?: number;
}

export const queryKey = (address: string | undefined) => `${address}/nfts`;

export const useGetUserNFTs = ({ address, size = 50 }: Props) => {
  return useQuery({
    queryKey: [queryKey(address)],
    queryFn: async (): Promise<AlchemyResponse> => {
      const response = await fetch(
        `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/getNFTsForOwner?owner=${address}&contractAddresses%5B%5D=${nftContract}&withMetadata=true&pageSize=${size}`,
      );
      return await response.json();
    },
    enabled: !!address,
  });
};
