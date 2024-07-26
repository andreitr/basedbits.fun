"use client";

import { DepositNFT } from "@/app/token/components/DepositNFT";
import { useGetUserNFTs } from "@/app/lib/hooks/useGetUserNFTs";
import { useAccount } from "wagmi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { useEffect, useState } from "react";
import { AlchemyToken } from "@/app/lib/types/alchemy";

export const TokenList = () => {
  const { isConnected, address } = useAccount();

  const [pageKey, setPageKey] = useState<string | undefined>(undefined);
  const [tokens, setTokens] = useState<AlchemyToken[]>([]);
  const { data, isLoading, isPlaceholderData } = useGetUserNFTs({
    address: address,
    pageKey: pageKey,
    size: 42,
  });

  useEffect(() => {
    if (data && data.pageKey !== pageKey) {
      setTokens((prevState) => [...prevState, ...data.ownedNfts]);
    }
  }, [data, pageKey]);

  if (!isConnected) {
    return <ConnectAction action={"exchange Based Bits for BBITS"} />;
  }

  if (isLoading) {
    return "Loading...";
  }

  if (data?.totalCount === 0) {
    return "No Based Bits in your wallet... Sad :(";
  }

  return (
    <div className="container max-w-screen-lg">
      <div className="text-xl mb-4 text-gray-600">
        {data?.totalCount} Based Bits
      </div>

      <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 sm:grid-cols-3 grid-cols-1">
        {tokens.map((nft, index) => {
          return (
            <div
              key={index}
              className="flex flex-col bg-[#ABBEAC] lg:p-2 md:p-6 p-8 rounded-md items-center justify-center"
            >
              <div
                className="bg-cover bg-center bg-no-repeat lg:w-[175px] lg:h-[175px] sm:w-[200px] sm:h-[200px] h-[300px] w-[300px] rounded-lg"
                style={{ backgroundImage: `url(${nft.image.thumbnailUrl})` }}
              ></div>
              <DepositNFT tokenId={nft.tokenId} />
            </div>
          );
        })}
      </div>
      {data?.pageKey && (
        <button
          onClick={() => {
            setPageKey(data.pageKey);
          }}
        >
          {isPlaceholderData ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
};
