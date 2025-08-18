"use client";

import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useContractBalance } from "@/app/lib/hooks/potraider/useContractBalance";
import { useTotalSupply } from "@/app/lib/hooks/potraider/useTotalSupply";
import { MintButton } from "@/app/potraider/components/MintButton";
import { formatUnits } from "ethers";
import { useState, useEffect } from "react";
import { base } from "viem/chains";

interface Props {
  lastJackpotEndTime: number;
  jackpot: number;
  history: [bigint, number];
}

export const MintComponent = ({
  lastJackpotEndTime,
  jackpot,
  history,
}: Props) => {
  const { data: contractBalance } = useContractBalance({
    address: process.env.NEXT_PUBLIC_RAIDER_ADDRESS as `0x${string}`,
    enabled: true,
    chainId: base.id,
  });

  const { data: totalSupply } = useTotalSupply({ enabled: true });

  const [mintProgress, setMintProgress] = useState(0);

  useEffect(() => {
    if (totalSupply) {
      setMintProgress(Math.round((Number(totalSupply) / 1000) * 100));
    }
  }, [totalSupply]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 sm:rounded-lg rounded-none text-white p-5">
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
                  last entry on{" "}
                  {new Date(Number(history[1]) * 1000).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )}
                </div>
                <div className="text-2xl text-[#FEC94F]">
                  {history[0].toString()} Tickets
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="uppercase text-xs text-gray-400">
                  next purchase
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
                    Total Treasury
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
