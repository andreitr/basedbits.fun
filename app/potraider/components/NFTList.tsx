"use client";

import { useRedeem } from "@/app/lib/hooks/potraider/useRedeem";
import { useGetOwnerNFTs } from "@/app/lib/hooks/useGetOwnerNFTs";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import Link from "next/link";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

interface Props {
  redeemValue?: [bigint, bigint]; // [ethShare, usdcShare]
}

export default function NFTList({ redeemValue }: Props) {
  const { isConnected, address } = useAccount();

  const { data: list, isLoading } = useGetOwnerNFTs({
    address: address,
    contract: process.env.NEXT_PUBLIC_RAIDER_ADDRESS!,
  });

  if (!isConnected) {
    return <div>Connect your wallet to view your PotRaiders</div>;
  }

  if (isLoading) {
    return <NFTListSkeleton />;
  }

  if (!isLoading && (!list || !list.ownedNfts || list.ownedNfts.length === 0)) {
    return <div>No NFTs found</div>;
  }

  return (
    <div>
      <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 grid-cols-2">
        {list?.ownedNfts?.map((nft, index) => {
          return <NFTCard key={index} nft={nft} redeemValue={redeemValue} />;
        })}
      </div>
    </div>
  );
}

export const NFTCard = ({
  nft,
  redeemValue,
}: {
  nft: AlchemyToken;
  redeemValue?: [bigint, bigint];
}) => {
  const { call: redeem, isFetching, isSuccess } = useRedeem();

  return (
    <div className="flex flex-col bg-[#ABBEAC] p-2 rounded-md items-center justify-center">
      <div
        className="bg-cover bg-center bg-no-repeat lg:w-[175px] lg:h-[175px] w-[115px] h-[115px] rounded-lg"
        style={{ backgroundImage: `url(${nft.image.originalUrl})` }}
      ></div>
      <div className="mt-2 w-full">
        <Link
          href={`https://opensea.io/assets/base/${nft.contract.address}/${nft.tokenId}`}
          target="_blank"
          className="hover:underline "
        >
          {nft.name}
        </Link>
        {redeemValue && (
          <div className="mt-2 text-gray-700 rounded-md p-2 w-full text-sm hover:text-black bg-black/10">
            <button
              className="cursor-pointer w-full"
              onClick={() => redeem(Number(nft.tokenId))}
            >
              <div>Redeem for</div>
              <div className="flex flex-row gap-2 pt-1 flex-wrap justify-center">
                <div>{Number(formatUnits(redeemValue[0], 18)).toFixed(5)}Ξ</div>
                {Number(redeemValue[1]) > 0 && (
                  <div>
                    + {Number(formatUnits(redeemValue[1], 6)).toFixed(2)} USDC
                  </div>
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const NFTListSkeleton = () => {
  const placeholders = Array.from({ length: 5 });
  return (
    <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 grid-cols-2">
      {placeholders.map((_, index) => (
        <div
          key={index}
          className="flex flex-col bg-[#ABBEAC] p-2 rounded-md items-center justify-center animate-pulse"
        >
          <div className="mb-8 lg:w-[175px] lg:h-[175px] w-[115px] h-[115px] rounded-lg bg-black bg-opacity-20"></div>
        </div>
      ))}
    </div>
  );
};
