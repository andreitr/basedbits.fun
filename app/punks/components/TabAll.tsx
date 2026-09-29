import Link from "next/link";
import { useGetNFTs } from "@/app/lib/hooks/useGetNFT";
import { useEffect, useState } from "react";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import {
  NFTGridSkeleton,
  NFTImage,
  NFTTile,
  nftGridClass,
} from "@/app/lib/components/NFTGrid";

const tileClass = "bg-black bg-opacity-90";

interface Props {
  contract: string;
}

export const TabAll = ({ contract }: Props) => {
  const [pageKey, setPageKey] = useState<string>("");
  const [tokens, setTokens] = useState<AlchemyToken[]>([]);

  const { data, isPlaceholderData, isLoading } = useGetNFTs({
    address: contract,
    pageKey: pageKey,
    size: 42,
  });

  useEffect(() => {
    if (data && data.pageKey !== pageKey) {
      setTokens((prevState) => {
        const newTokens = data?.nfts.filter(
          (nft) =>
            !prevState.some(
              (existingNft) => existingNft.tokenId === nft.tokenId,
            ),
        );
        return [...prevState, ...newTokens];
      });
    }
  }, [data, pageKey]);

  // Tokens are appended in an effect, so the first render with data still has none; keep the skeleton up until then
  if (isLoading || (tokens.length === 0 && !!data?.nfts?.length)) {
    return <NFTGridSkeleton tileClassName={tileClass} />;
  }

  return (
    <>
      <div>
        <div className={nftGridClass}>
          {tokens.map((nft, index) => {
            return (
              <NFTTile key={index} className={tileClass}>
                <NFTImage src={nft.image.originalUrl} alt={nft.name} />
                <div className="mt-2 hover:underline text-white truncate max-w-full">
                  <Link
                    href={`https://opensea.io/assets/base/${contract}/${nft.tokenId}`}
                    target="_blank"
                  >
                    {nft.name}
                  </Link>
                </div>
              </NFTTile>
            );
          })}
        </div>
      </div>
      {data?.pageKey && (
        <button
          className="text-lg py-4 px-6 mt-8  border border-black rounded-lg"
          onClick={() => {
            setPageKey(data.pageKey);
          }}
        >
          {isPlaceholderData ? "Loading..." : "Load More"}
        </button>
      )}
    </>
  );
};
