import Link from "next/link";
import { useGetNFTs } from "@/app/lib/hooks/useGetNFT";
import { useEffect, useState } from "react";
import { AlchemyToken } from "@/app/lib/types/alchemy";

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

  if (isLoading) {
    return "Loading ...";
  }

  return (
    <>
      <div>
        <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 grid-cols-2">
          {tokens.map((nft, index) => {
            return (
              <div
                key={index}
                className="flex flex-col bg-black bg-opacity-90 p-2 rounded-md items-center justify-center"
              >
                <div
                  className="bg-cover bg-center bg-no-repeat lg:w-[175px] lg:h-[175px] w-[115px] h-[115px] rounded-lg"
                  style={{ backgroundImage: `url(${nft.image.originalUrl})` }}
                ></div>
                <div className="mt-2 hover:underline text-white">
                  <Link
                    href={`https://opensea.io/assets/base/${contract}/${nft.tokenId}`}
                    target="_blank"
                  >
                    {nft.name}
                  </Link>
                </div>
              </div>
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
