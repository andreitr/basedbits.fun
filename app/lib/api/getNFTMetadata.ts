import { type AlchemyToken } from "@/app/lib/types/alchemy";

interface Props {
  tokenId: string;
  contract: string;
}

export const getNFTMetadata = async ({ tokenId, contract }: Props) => {
  const meta: AlchemyToken = await fetch(
    `https://base-sepolia.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/getNFTMetadata?contractAddress=${contract}&tokenId=${tokenId}&tokenType=ERC721`,
    {
      next: { revalidate: 60 },
    },
  ).then((res) => res.json());

  return meta;
};
