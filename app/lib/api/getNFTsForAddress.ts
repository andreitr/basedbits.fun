import { type AlchemyUserResponse } from "@/app/lib/types/alchemy";
import { baseNFTUrl } from "@/app/lib/Web3Configs";

interface Props {
  address: string;
  size: number;
}

export const getNFTsForAddress = async ({ address, size }: Props) => {
  const nftContract = process.env.NEXT_PUBLIC_BB_NFT_ADDRESS;

  const contractNFTs: AlchemyUserResponse = await fetch(
    `${baseNFTUrl}/getNFTsForOwner?owner=${address}&contractAddresses%5B%5D=${nftContract}&withMetadata=true&orderBy=transferTime&pageSize=${size}`,
    {
      next: { revalidate: 60 },
    },
  ).then((res) => res.json());

  return contractNFTs;
};
