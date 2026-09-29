"use client";

import { DepositNFT } from "@/app/token/components/DepositNFT";
import { useGetOwnerNFTs } from "@/app/lib/hooks/useGetOwnerNFTs";
import { useEffect, useState } from "react";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { RedeemNFT } from "@/app/token/components/RedeemNFT";
import {
  NFTGridSkeleton,
  NFTImage,
  NFTTile,
  nftGridClass,
} from "@/app/lib/components/NFTGrid";

const tileClass = "bg-[#ABBEAC]";

interface Props {
  action: "SWAP" | "REDEEM";
  address: `0x${string}` | undefined;
  label: string;
}

export const TokenList = ({ action, address, label }: Props) => {
  const [pageKey, setPageKey] = useState<string | undefined>(undefined);
  const [tokens, setTokens] = useState<AlchemyToken[]>([]);
  const { data, isLoading, isPlaceholderData } = useGetOwnerNFTs({
    contract: process.env.NEXT_PUBLIC_BB_NFT_ADDRESS!,
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

  if (isLoading || (tokens.length === 0 && !!data?.ownedNfts?.length)) {
    return (
      <div>
        <div className="h-7 w-64 my-4 rounded bg-[#ABBEAC] animate-pulse" />
        <NFTGridSkeleton count={5} tileClassName={tileClass} />
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="text-xl my-4 text-gray-600">
          {data?.totalCount} Based Bits {label}
        </div>

        <div className={nftGridClass}>
          {tokens.map((nft, index) => {
            return (
              <NFTTile key={index} className={tileClass}>
                <NFTImage
                  src={nft.image.originalUrl}
                  alt={`Based Bit #${nft.tokenId}`}
                />
                {action === "SWAP" && <DepositNFT tokenId={nft.tokenId} />}
                {action === "REDEEM" && <RedeemNFT tokenId={nft.tokenId} />}
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
