import { type AlchemyToken } from "@/app/lib/types/alchemy";
import { ALCHEMY_API_PATH } from "@/app/lib/constants";

interface Props {
  contract: string;
  path: ALCHEMY_API_PATH;
  refreshCache: boolean;
  tokenId: string;
  tokenType: "ERC721" | "ERC1155";
}

export const getNFTMetadata = async ({
  contract,
  path,
  refreshCache,
  tokenId,
  tokenType,
}: Props) => {
  const meta: AlchemyToken = await fetch(
    `https://${path}.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/getNFTMetadata?contractAddress=${contract}&tokenId=${tokenId}&tokenType=${tokenType}&refreshCache=${refreshCache}`,
    {
      next: { revalidate: 60 },
    },
  ).then((res) => res.json());
  return meta;
};
