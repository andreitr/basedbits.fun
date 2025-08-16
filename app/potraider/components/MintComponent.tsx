"use client";

import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useContractBalance } from "@/app/lib/hooks/potraider/useContractBalance";
import { useTotalSupply } from "@/app/lib/hooks/potraider/useTotalSupply";
import { MintButton } from "@/app/potraider/components/MintButton";
import { formatUnits } from "ethers";

interface Props {
  lastJackpotEndTime: number;
  jackpot: number;
  totalDays: number;
  currentDay: number;
}

export const MintComponent = ({
  lastJackpotEndTime,
  jackpot,
  totalDays,
  currentDay,
}: Props) => {
  const { data: contractBalance } = useContractBalance({
    address: process.env.NEXT_PUBLIC_RAIDER_ADDRESS as `0x${string}`,
  });

  const { data: totalSupply } = useTotalSupply({ enabled: true });
  const mintProgress = totalSupply ? (Number(totalSupply) / 1000) * 100 : 0;

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 rounded-lg text-white p-5">
      <div className="flex flex-col sm:flex-row w-full gap-5">
        <div className="flex flex-col lg:gap-7 justify-between w-full">
          <div>
            <div className="flex flex-col gap-2 hidden sm:flex justify-center items-center py-12">
              <div className="text-6xl text-[#FFE29E]">
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
                <div className="text-2xl text-[#FEC94F]">
                  {
                    <CountDownToDate
                      targetDate={Number(lastJackpotEndTime) + 86400}
                      message="Raid Started"
                    />
                  }
                </div>
              </div>

              {contractBalance && (
                <div className="flex flex-col gap-2">
                  <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
                    Treasury
                  </div>
                  <div className="text-2xl text-[#FEC94F]">
                    {Number(formatUnits(contractBalance, 18)).toFixed(5)}Ξ
                  </div>
                </div>
              )}
              {totalSupply && (
                <div className="flex flex-col gap-2">
                  <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
                    Mint Progress
                  </div>
                  <div className="text-2xl text-[#FEC94F]">{mintProgress}%</div>
                </div>
              )}
            </div>
          </div>
          <MintButton />
        </div>
      </div>
    </div>
  );
};
