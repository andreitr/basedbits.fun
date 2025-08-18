"use client";

import { useBalanceOf } from "@/app/lib/hooks/potraider/useBalanceOf";
import { useCirculatingSupply } from "@/app/lib/hooks/potraider/useCirculatingSupply";
import { useContractBalance } from "@/app/lib/hooks/potraider/useContractBalance";
import { useRedeem } from "@/app/lib/hooks/potraider/useRedeem";
import { useRedeemValue } from "@/app/lib/hooks/potraider/useRedeemValue";
import { useTotalSupply } from "@/app/lib/hooks/potraider/useTotalSupply";
import { useGetOwnerNFTs } from "@/app/lib/hooks/useGetOwnerNFTs";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { truncateAddress } from "@/app/lib/utils/addressUtils";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

export const NFTList = () => {
  const { isConnected, address } = useAccount();
  const { data: redeemValue } = useRedeemValue();
  const { data: totalSupply } = useTotalSupply({ enabled: true });
  const { data: list, isLoading } = useGetOwnerNFTs({
    address,
    contract: process.env.NEXT_PUBLIC_RAIDER_ADDRESS!,
  });

  const [callToAction, setCallToAction] = useState<React.ReactNode>(
    "Mint while you can!",
  );

  useEffect(() => {
    if (totalSupply) {
      if (Number(totalSupply) >= 1) {
        setCallToAction(
          <>
            Buy Pot Raiders on{" "}
            <Link
              href={`https://opensea.io/item/base/${process.env.NEXT_PUBLIC_RAIDER_ADDRESS}`}
              className="underline"
              target="_blank"
            >
              OpenSea
            </Link>
          </>,
        );
      }
    }
  }, [totalSupply]);

  if (!isConnected || !address) {
    return <div>Connect wallet to view your Pot Raiders 💰💀</div>;
  }

  if (!isLoading && (!list || !list.ownedNfts || list.ownedNfts.length === 0)) {
    return (
      <div>
        No Pot Raiders found in {truncateAddress(address)}. {callToAction}
      </div>
    );
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
};

export const NFTCard = ({
  nft,
  redeemValue,
}: {
  nft: AlchemyToken;
  redeemValue?: [bigint, bigint];
}) => {
  const { address } = useAccount();
  const { call: redeem, isFetching, isSuccess } = useRedeem();
  const { invalidate: invalidateRedeemValue } = useRedeemValue({
    enabled: false,
  });
  const { invalidate: invalidateCirculatingSupply } = useCirculatingSupply({
    enabled: false,
  });
  const { invalidate: invalidateBalanceOf } = useBalanceOf({
    address: address,
    enabled: false,
  });
  const { invalidate: invalidateContractBalance } = useContractBalance({
    address: process.env.NEXT_PUBLIC_RAIDER_ADDRESS as `0x${string}`,
    enabled: false,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isSuccess && !isFetching) {
      queryClient
        .invalidateQueries({
          queryKey: ["getNFTsForOwner", process.env.NEXT_PUBLIC_RAIDER_ADDRESS],
        })
        .then(() => {
          invalidateRedeemValue();
          invalidateCirculatingSupply();
          invalidateBalanceOf();
          invalidateContractBalance();
        })
        .finally(() => {
          console.log("invalidated");
        });
    }
  }, [isSuccess, isFetching]);

  return (
    <div className="flex flex-col bg-[#ABBEAC] p-2 rounded-md items-center justify-center w-full">
      <div
        className="bg-cover bg-center bg-no-repeat w-full aspect-square rounded-lg"
        style={{ backgroundImage: `url(${nft.image.originalUrl})` }}
      ></div>
      <div className="mt-2 w-full">
        <Link
          href={`https://opensea.io/assets/base/${nft.contract.address}/${nft.tokenId}`}
          target="_blank"
          className="hover:underline text-sm sm:text-base"
        >
          {nft.name}
        </Link>
        {redeemValue && (
          <div className="mt-2 text-black rounded-md p-2 w-full text-xs sm:text-sm bg-black/10 hover:bg-black/20">
            <button
              className="cursor-pointer w-full"
              onClick={() => redeem(Number(nft.tokenId))}
              disabled={isFetching}
            >
              <>
                <div>
                  {isSuccess
                    ? "Redeemed!"
                    : isFetching
                      ? "Redeeming..."
                      : "Redeem for"}
                </div>
                <div className="flex flex-row gap-1 sm:gap-2 pt-1 flex-wrap justify-center">
                  <div>
                    {Number(formatUnits(redeemValue[0], 18)).toFixed(5)}Ξ
                  </div>
                  {Number(redeemValue[1]) > 0 && (
                    <div>
                      + {Number(formatUnits(redeemValue[1], 6)).toFixed(2)} USDC
                    </div>
                  )}
                </div>
              </>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
