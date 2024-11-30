import { type AlchemyCollection } from "@/app/lib/types/alchemy";
import { ALCHEMY_API_PATH } from "@/app/lib/constants";

interface Props {
  contract: string;
  path: ALCHEMY_API_PATH;
}

export const getNFTCollectionMetadata = async ({ contract, path }: Props) => {
  const meta: AlchemyCollection = await fetch(
    `https://${path}.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/getContractMetadata?contractAddress=${contract}`,
  ).then((res) => res.json());
  return meta;
};
