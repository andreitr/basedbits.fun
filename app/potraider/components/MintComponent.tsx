"use client";

import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useLotteryJackpot } from "@/app/lib/hooks/potraider/useLotteryJackpot";
import { MintButton } from "@/app/potraider/components/MintButton";
import NumberFlow from "@number-flow/react";
import { formatUnits } from "ethers";
import { useEffect, useState } from "react";

interface Props {
  count: number;
  lastJackpotEndTime: number;
  dailySpent: number;
}

export const MintComponent = ({ count, lastJackpotEndTime, dailySpent }: Props) => {

  

  const { data: loadedJackpot } = useLotteryJackpot({ enabled: true });

  const [jackpot, setJackpot] = useState(0);

  useEffect(() => {
    if (loadedJackpot) {
      setJackpot(Math.round(Number(formatUnits(loadedJackpot, 6))));
    }
  }, [loadedJackpot]);


  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 rounded-lg text-white p-5">
      <div className="flex flex-col sm:flex-row w-full gap-5">
        
        <div className="flex flex-col-reverse sm:flex-col lg:gap-7 justify-between w-full">
          <div>
            <div className="flex flex-col gap-2 hidden sm:flex justify-center items-center">
              <div className="text-6xl">
                <NumberFlow 
                  value={jackpot} 
                  prefix="$"
                  format={{ useGrouping: true }}
                  trend={1}
                  digits={{ 1: { max: 5 } }}
                />
              </div>
              <div className="text-sm text-gray-400">
                Every day {count} PotRaiders purchase Megapot tickets in hopes of a big win. Proceeds split beteen raiders.
              </div>
            </div>

            <div className="border-b border-gray-700 my-6"></div>

            <div className="flex flex-wrap gap-4 sm:gap-8">
              <div className="flex flex-col gap-1">
                <div className="uppercase text-xs text-gray-400">Next Drawing</div>
                <div className="text-3xl text-[#52cba1]">
                  {<CountDownToDate targetDate={Number(lastJackpotEndTime) + 86400} message="Raid Started" />}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
                  Daily Pool
                </div>
                                 <div className="text-3xl text-[#52cba1]">
                   {Number(formatUnits(dailySpent, 18)).toFixed(5)}Ξ
                 </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
                  Duration / Days
                </div>
                  <div className="text-3xl text-[#52cba1]">
                   2/365
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