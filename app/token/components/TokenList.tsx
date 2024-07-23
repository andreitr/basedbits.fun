"use client";

import Image from "next/image";
import { DepositNFT } from "@/app/token/components/DepositNFT";
import { useGetUserNFTs } from "@/app/lib/hooks/useGetUserNFTs";
import { useAccount } from "wagmi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";

export const TokenList = () => {
  const { isConnected, address } = useAccount();

  const { data, isLoading } = useGetUserNFTs({ address: address, size: 200 });

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
    <div>
      <div className="grid grid-cols-7 gap-3">
        {data?.ownedNfts.map((nft, index) => {
          return (
            <div
              key={index}
              className="bg-[#ABBEAC] p-2 rounded-md sm:w-100 w-140"
            >
              <Image
                className="rounded-lg"
                src={nft.image.thumbnailUrl}
                alt={nft.name}
                width={120}
                height={120}
              />
              <DepositNFT tokenId={nft.tokenId} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
