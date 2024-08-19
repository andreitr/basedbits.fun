import { type AlchemyToken } from "@/app/lib/types/alchemy";
import { ALCHEMY_API_PATH } from "@/app/lib/constants";

interface Props {
  path: ALCHEMY_API_PATH;
  contract: string;
  tokenId: string;
}

export const getNFTMetadata = async ({ tokenId, contract, path }: Props) => {
  const meta: AlchemyToken = await fetch(
    `https://${path}.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/getNFTMetadata?contractAddress=${contract}&tokenId=${tokenId}&tokenType=ERC721`,
    {
      next: { revalidate: 60 },
    },
  ).then((res) => res.json());

  return meta;
};
