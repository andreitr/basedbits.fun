"use client";

import { MintButton } from "@/app/aeye/components/MintButton";
import { CountDown } from "@/app/lib/components/client/CountDown";
import { Tooltip } from "@/app/lib/components/client/Tooltip";
import { useCommunityRewards } from "@/app/lib/hooks/aeye/useCommunityRewards";
import { useCurrentMint } from "@/app/lib/hooks/aeye/useCurrentMint";
import { useMintsPerToken } from "@/app/lib/hooks/aeye/useMintsPerToken";
import { InfoOutline } from "@/app/lib/icons/remix";
import { DBAeye } from "@/app/lib/types/types";
import { formatUnits } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";

export const MintComponent = ({ token }: { token: DBAeye }) => {
  const tokenId = token.token;
  const [isMintEnded, setIsMintEnded] = useState(false);
  const [initialLoadTime] = useState(() => new Date().getUTCHours());

  const { data: currentMint } = useCurrentMint({ enabled: isMintEnded });

  const { data: rewards } = useCommunityRewards({
    tokenId: tokenId,
    enabled: true,
  });

  const { data: mints } = useMintsPerToken({
    tokenId: tokenId,
    enabled: true,
  });

  useEffect(() => {
    if (currentMint && currentMint > token.id) {
      window.location.reload();
    }
  }, [currentMint, tokenId]);

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
        <Image
          className="rounded-lg w-full sm:w-[300px] h-auto sm:h-[300px]"
          src={token.image || "/images/aeye.png"}
          alt={token.headline || "AEYE Genesis NFT"}
          width={300}
          height={300}
          priority
        />
        <div className="flex flex-col-reverse sm:flex-col lg:gap-7 justify-between w-full">
          <div>
            <div className="flex flex-col gap-2 hidden sm:flex">
              <div className="text-2xl">AEYE: GENESIS</div>
              <div className="text-sm text-gray-400">
                The AEYE agent watches the world each day, reflecting on the
                most important story in the rise of artificial intelligence, and
                mints a daily NFT dispatch as a lasting cultural artifact.
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
                  Community Rewards
                  <Tooltip
                    content={
                      <div>
                        50% of mint fees sent to minters of previous days
                      </div>
                    }
                  >
                    <InfoOutline
                      fill="#CCCCCC"
                      className="inline-block w-4 h-4 fill-gray-400 hover:fill-white cursor-pointer"
                      aria-label="Community rewards"
                    />
                  </Tooltip>
                </div>
                <div className="text-3xl text-[#52cba1]">
                  {formatUnits(rewards || 0, 18).slice(0, 7)}Ξ
                </div>
              </div>
              <div className="flex flex-col gap-2 hidden sm:flex">
                <div className="uppercase text-xs text-gray-400">Mints</div>
                <div className="text-3xl text-[#62CDA7]">{mints || 0}</div>
              </div>
            </div>
          </div>
          {<MintButton token={token} />}
        </div>
      </div>
    </div>
  );
};
