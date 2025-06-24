"use client";

import { CountDown } from "@/app/lib/components/client/CountDown";
import { Tooltip } from "@/app/lib/components/client/Tooltip";
import { InfoOutline } from "@/app/lib/icons/remix";
import { MintButton } from "@/app/potraider/components/MintButton";
import { useEffect, useState } from "react";

export const MintComponent = () => {
  const [isMintEnded, setIsMintEnded] = useState(false);
  const [initialLoadTime] = useState(() => new Date().getUTCHours());

  useEffect(() => {
    const checkMintEnd = () => {
      const currentHour = new Date().getUTCHours();
      if (initialLoadTime < 20 && currentHour >= 20) {
        setIsMintEnded(true);
      }
    };
    checkMintEnd();
    const interval = setInterval(checkMintEnd, 10000);
    return () => clearInterval(interval);
  }, [initialLoadTime]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 rounded-lg text-white p-5">
      <div className="flex flex-col sm:flex-row w-full gap-5">
        <div className="rounded-lg w-full sm:w-[300px] h-auto sm:h-[300px] bg-gray-800 flex items-center justify-center">
          <div className="text-4xl">🏴‍☠️</div>
        </div>
        <div className="flex flex-col-reverse sm:flex-col lg:gap-7 justify-between w-full">
          <div>
            <div className="flex flex-col gap-2 hidden sm:flex">
              <div className="text-2xl">POTRAIDER: GENESIS</div>
              <div className="text-sm text-gray-400">
                Daily PotRaider NFTs. Mint your PotRaider now on BASE.
              </div>
            </div>

            <div className="border-b border-gray-700 my-6"></div>

            <div className="flex flex-wrap gap-4 sm:gap-8">
              <div className="flex flex-col gap-1">
                <div className="uppercase text-xs text-gray-400">Mint Ends</div>
                <div className="text-3xl text-[#52cba1]">
                  {isMintEnded ? "Mint Ended" : <CountDown hour={18} />}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
                  Mint Price
                  <Tooltip
                    content={
                      <div>
                        Current mint price for PotRaider NFTs
                      </div>
                    }
                  >
                    <InfoOutline
                      fill="#CCCCCC"
                      className="inline-block w-4 h-4 fill-gray-400 hover:fill-white cursor-pointer"
                      aria-label="Mint price"
                    />
                  </Tooltip>
                </div>
                <div className="text-3xl text-[#52cba1]">
                  Dynamic
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