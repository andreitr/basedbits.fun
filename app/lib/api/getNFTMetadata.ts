import { type AlchemyToken } from "@/app/lib/types/alchemy";

interface Props {
  tokenId: string;
}

export const getNFTMetadata = async ({ tokenId }: Props) => {
  const nftContract = process.env.NEXT_PUBLIC_BB_NFT_ADDRESS;

  ("https://eth-mainnet.g.alchemy.com/nft/v3/docs-demo/getNFTMetadata?contractAddress=0xe785E82358879F061BC3dcAC6f0444462D4b5330&tokenId=44&refreshCache=false");

  const meta: AlchemyToken = await fetch(
    `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/getNFTMetadata?contractAddress=${nftContract}&tokenId=${tokenId}&tokenType=ERC721`,
    {
      next: { revalidate: 60 },
    },
  ).then((res) => res.json());

  return meta;
};
