import { type AlchemyResponse } from "@/app/lib/types/alchemy";

interface Props {
  address: string;
  size: number;
}

export const getUserNFTs = async ({ address, size }: Props) => {
  const nftContract = process.env.NEXT_PUBLIC_BB_NFT_ADDRESS;

  const contractNFTs: AlchemyResponse = await fetch(
    `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/getNFTsForOwner?owner=${address}&contractAddresses%5B%5D=${nftContract}&withMetadata=true&orderBy=transferTime&pageSize=${size}`,
    {
      next: { revalidate: 60 },
    },
  ).then((res) => res.json());

  return contractNFTs;
};
