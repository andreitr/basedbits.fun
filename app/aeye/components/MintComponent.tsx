"use client";

import { MintButton } from "@/app/aeye/components/MintButton";
import { CountDown } from "@/app/lib/components/client/CountDown";
import { Tooltip } from "@/app/lib/components/client/Tooltip";
import { useAeyeById } from "@/app/lib/hooks/aeye/useAeyeById";
import { useCommunityRewards } from "@/app/lib/hooks/aeye/useCommunityRewards";
import { useCurrentMint } from "@/app/lib/hooks/aeye/useCurrentMint";
import { useMintsPerToken } from "@/app/lib/hooks/aeye/useMintsPerToken";
import { InfoOutline } from "@/app/lib/icons/remix";
import { DBAeye } from "@/app/lib/types/types";
import { formatUnits } from "ethers";
import Image from "next/image";

export const MintComponent = ({ token }: { token?: DBAeye }) => {

  const { data: currentMint } = useCurrentMint({ enabled: true });
  
  const { data: loadedTokenMeta } = useAeyeById({
    id: currentMint,
    enabled: !token && !!currentMint,
  });

  const { data: rewards } = useCommunityRewards({
    tokenId: token?.id || currentMint || 0,
    enabled: true,
  });

  const { data: mints } = useMintsPerToken({
    tokenId: token?.id || currentMint || 0,
    enabled: true,
  });

  const displayToken = token || loadedTokenMeta;
  const humanDate = new Date(displayToken?.created_at || "").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 rounded-lg text-white p-5 ">
      <div className="flex flex-col sm:flex-row w-full gap-5">
        <Image
          className="rounded-lg w-full sm:w-[300px] h-auto sm:h-[300px]"
          src={displayToken?.image || ""}
          alt={displayToken?.headline || ""}
          width={300}
          height={300}
        />
        <div className="flex flex-col-reverse sm:flex-col lg:gap-7 justify-between w-full">
          <div>
            <div className="flex flex-col gap-2 hidden sm:flex">
              <div className="text-2xl">AEYE: GENESIS</div>
              <div className="text-sm text-gray-400">
              The AEYE agent watches the world each day, reflecting on the most important story in the rise of artificial intelligence, and mints a daily NFT dispatch as a lasting cultural artifact.
              </div>
            </div>

            <div className="border-b border-gray-700 my-6"></div>

            <div className="flex flex-wrap gap-4 sm:gap-8">
              <div className="flex flex-col gap-1">
                <div className="uppercase text-xs text-gray-400">Mint Ends</div>
                <div className="text-3xl text-[#52cba1]">
                  <CountDown hour={20} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
                  Community Rewards
                  <Tooltip content="50% of mint fees sent to minters of previous days">
                    <InfoOutline
                      fill="#CCCCCC"
                      className="inline-block w-4 h-4 fill-gray-400 hover:fill-white cursor-pointer"
                    />
                  </Tooltip>
                </div>
                <div className="text-3xl text-[#52cba1]">
                  {`${formatUnits(rewards || 0, 18).slice(0, 7)}Ξ`}
                </div>
              </div>
              <div className="flex flex-col gap-1 hidden sm:flex">
                <div className="uppercase text-xs text-gray-400">Mints</div>
                <div className="text-3xl text-[#62CDA7]">{mints}</div>
              </div>
            </div>
          </div>
          {displayToken && <MintButton token={displayToken} />}
        </div>
      </div>
    </div>
  );
};
