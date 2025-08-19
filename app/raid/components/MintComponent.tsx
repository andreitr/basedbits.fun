"use client";

import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useContractBalance } from "@/app/lib/hooks/potraider/useContractBalance";
import { useTotalSupply } from "@/app/lib/hooks/potraider/useTotalSupply";
import { MintButton } from "@/app/raid/components/MintButton";
import { formatUnits } from "ethers";
import { base } from "viem/chains";
import Image from "next/image";
import Link from "next/link";

interface Props {
  jackpot: number;
  history: [bigint, number];
}

export const MintComponent = ({ jackpot, history }: Props) => {
  const { data: contractBalance } = useContractBalance({
    address: process.env.NEXT_PUBLIC_RAIDER_ADDRESS as `0x${string}`,
    enabled: true,
    chainId: base.id,
  });

  const { data: totalSupply } = useTotalSupply({ enabled: true });
  const jackpotFormatted = Number(formatUnits(jackpot, 6)).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );



  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 sm:rounded-lg rounded-none text-white p-5">
      <div className="flex flex-col sm:flex-row w-full gap-5">
        <div>
          <Image
            src="/images/raider_black.svg"
            alt="Pot Raider"
            width={100}
            height={100}
            className="w-full sm:w-[400px] rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-7 justify-between w-full">
          <div>
            <div className="flex flex-col gap-2 justify-center pb-6">
              <div className="sm:text-5xl text-4xl text-[#FEC94F]">
                Pot Raiders
              </div>
              <div className="text-sm text-gray-400">
                For a full year, Pot Raiders will spend a share of the treasury
                on{" "}
                <Link
                  href="https://megapot.io"
                  target="_blank"
                  className="underline hover:text-white"
                >
                  Megapot
                </Link>{" "}
                tickets. Current jackpot is{" "}
                <span className="font-semibold">${jackpotFormatted}</span>. Join
                the raid!
              </div>
            </div>
            <div className="border-b border-gray-700 mb-6"></div>

            <div className="flex flex-wrap gap-4 sm:gap-8 items-center w-full">
              {history[0] > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="uppercase text-xs text-gray-400">
                    last raid:{" "}
                    {new Date(Number(history[1]) * 1000).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    )}
                  </div>
                  <div className="text-2xl text-[#FEC94F]">
                    {history[0].toString()} Tickets
                  </div>
                </div>
              )}

              {history[0] > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="uppercase text-xs text-gray-400">
                    next raid
                  </div>
                  <div className="text-2xl text-[#FEC94F]">
                    {
                      <CountDownToDate
                        targetDate={Number(history[1]) + 86400}
                        message="Raid Started"
                      />
                    }
                  </div>
                </div>
              )}

              {history[0] === BigInt(0) && (
                <div className="flex flex-col gap-1">
                  <div className="uppercase text-xs text-gray-400">
                    next raid
                  </div>
                  <div className="text-2xl text-[#FEC94F]">Starts soon</div>
                </div>
              )}

              {contractBalance && (
                <div className="flex flex-col gap-2">
                  <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
                    treasury
                  </div>
                  <div className="text-2xl text-[#FEC94F]">
                    {Number(formatUnits(contractBalance, 18)).toFixed(5)}Ξ
                  </div>
                </div>
              )}

              
                <div className="flex flex-col gap-2 hidden sm:flex">
                  <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
                    mint progress
                  </div>
                  <div className="text-2xl text-[#FEC94F]">
                    Sold out
                  </div>
                </div>
              
            </div>
          </div>
          {totalSupply && Number(totalSupply) < 1000 ? (
            <MintButton />
          ) : (
            <div className="text-sm text-gray-400">
              Pot Raiders are sold out! Buy on{" "}
              <Link
                href={`https://opensea.io/item/base/${process.env.NEXT_PUBLIC_RAIDER_ADDRESS}`}
                className="underline"
                target="_blank"
              >
                OpenSea
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
