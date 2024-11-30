"use client";

import { DepositNFT } from "@/app/token/components/DepositNFT";
import { useGetUserNFTs } from "@/app/lib/hooks/useGetUserNFTs";
import { useEffect, useState } from "react";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { RedeemNFT } from "@/app/token/components/RedeemNFT";

interface Props {
  action: "SWAP" | "REDEEM";
  address: `0x${string}` | undefined;
  label: string;
}

export const TabAll = ({ action, address, label }: Props) => {
  const [pageKey, setPageKey] = useState<string | undefined>(undefined);
  const [tokens, setTokens] = useState<AlchemyToken[]>([]);
  const { data, isLoading, isPlaceholderData } = useGetUserNFTs({
    contract: process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS!,
    address: address,
    pageKey: pageKey,
    size: 42,
  });

  useEffect(() => {
    if (data && data.pageKey !== pageKey) {
      setTokens((prevState) => {
        const newTokens = data.ownedNfts.filter(
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
    return "Loading...";
  }

  return (
    <>
      <div>
        <div className="text-xl my-4 text-gray-600">
          {data?.totalCount} Based Bits {label}
        </div>

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
                {action === "SWAP" && <DepositNFT tokenId={nft.tokenId} />}
                {action === "REDEEM" && <RedeemNFT tokenId={nft.tokenId} />}
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
