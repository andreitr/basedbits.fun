"use client";

import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { MintButton } from "@/app/potraider/components/MintButton";
import NumberFlow from "@number-flow/react";
import { formatUnits } from "ethers";

interface Props {
  count: number;
  lastJackpotEndTime: number;
  dailySpent: number;
  jackpot: number;
  totalDays: number;
  currentDay: number;
  contractBalance: bigint;
  redeemValue: [bigint, bigint]; // [ethShare, usdcShare]
}

export const MintComponent = ({
  count,
  lastJackpotEndTime,
  dailySpent,
  jackpot,
  totalDays,
  currentDay,
  contractBalance,
  redeemValue,
}: Props) => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 rounded-lg text-white p-5">
      <div className="flex flex-col sm:flex-row w-full gap-5">
        <div className="flex flex-col-reverse sm:flex-col lg:gap-7 justify-between w-full">
          <div>
            <div className="flex flex-col gap-2 hidden sm:flex justify-center items-center py-12">
              <div className="text-6xl text-[#FEC94F]">
                $
                {Number(formatUnits(jackpot, 6)).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-sm text-gray-400">
                Every day raid the Megapot in hopes of a big win. Proceeds split
                beteen raiders.
              </div>
            </div>

            <div className="border-b border-gray-700 mb-6"></div>

            <div className="flex flex-wrap gap-4 sm:gap-8 justify-center items-center w-full">
              <div className="flex flex-col gap-1">
                <div className="uppercase text-xs text-gray-400">
                  Next Drawing
                </div>
                <div className="text-3xl text-[#FEC94F]">
                  {
                    <CountDownToDate
                      targetDate={Number(lastJackpotEndTime) + 86400}
                      message="Raid Started"
                    />
                  }
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
                  Daily Pool
                </div>
                <div className="text-3xl text-[#FEC94F]">
                  {Number(formatUnits(dailySpent, 18)).toFixed(5)}Ξ
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
                  Duration / Days
                </div>
                <div className="text-3xl text-[#FEC94F]">
                  {currentDay}/{totalDays}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
                  Total Treasury
                </div>
                <div className="text-3xl text-[#FEC94F]">
                  {Number(formatUnits(contractBalance, 18)).toFixed(5)}Ξ
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
                  NFT Redeem Value
                </div>
                <div className="text-3xl text-[#FEC94F]">
                  {Number(formatUnits(redeemValue[0], 18)).toFixed(5)}Ξ
                </div>
              </div>
            </div>
          </div>
          {<MintButton />}
        </div>
      </div>
    </div>
  );
};
