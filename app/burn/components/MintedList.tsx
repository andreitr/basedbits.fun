"use client";

import {useEffect, useState} from "react";
import {AlchemyToken} from "@/app/lib/types/alchemy";
import {useGetNFTs} from "@/app/lib/hooks/useGetNFT";

export const MintedList = () => {
  const [pageKey, setPageKey] = useState<string | undefined>(undefined);
  const [tokens, setTokens] = useState<AlchemyToken[]>([]);

  const { data, isLoading, isPlaceholderData } = useGetNFTs({
    address: "0x628cb4601CB45Fb4daCDE367041fC49a74Da8020",
    pageKey: pageKey,
    size: 42,
  });

  console.log(data);

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
    return "Loading minted NFTs...";
  }

  return (
    <>
      <div>
        <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 grid-cols-2">
          {tokens.map((nft, index) => {
            return (
              <div
                key={index}
                className="flex flex-col bg-[#ABBEAC] p-2 rounded-md items-center justify-center"
              >
                <div
                  className="bg-cover bg-center bg-no-repeat lg:w-[175px] lg:h-[175px] w-[115px] h-[115px] rounded-lg"
                  style={{ backgroundImage: `url(${nft.image.thumbnailUrl})` }}
                ></div>
                <div className="mt-2">{nft.name}</div>
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
