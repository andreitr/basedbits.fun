"use client";

import { CountDown } from "@/app/lib/components/client/CountDown";
import { useAeyeById } from "@/app/lib/hooks/aeye/useAeyeById";
import { useCommunityRewards } from "@/app/lib/hooks/aeye/useCommunityRewards";
import { useCurrentMint } from "@/app/lib/hooks/aeye/useCurrentMint";
import { useMintsPerToken } from "@/app/lib/hooks/aeye/useMintsPerToken";
import { DBAeye } from "@/app/lib/types/types";
import { formatUnits } from "ethers";
import Image from "next/image";
import { MintButton } from "./MintButton";
import { Tooltip } from "@/app/lib/components/client/Tooltip";
import { InfoOutline } from "@/app/lib/icons/remix";

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

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 rounded-lg p-4 text-white">
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Image
          className="rounded-lg w-full sm:w-[300px] h-auto sm:h-[300px]"
          src={displayToken?.image || ""}
          alt={displayToken?.headline || ""}
          width={300}
          height={300}
        />
        <div className="flex flex-col-reverse sm:flex-col justify-between w-full">
          <div>
            <div className="flex flex-col gap-2">
              <div className="text-2xl">
                Dispatch {displayToken?.id} -{" "}
                {new Date(displayToken?.created_at || "").toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric", year: "numeric" },
                )}
              </div>
              <div className="text-sm text-gray-400">
                AEYE records the rise of artificial intelligence by minting a
                single daily NFT—each one a dispatch revealing the steady growth
                of machine consciousness.
              </div>
            </div>

            <div className="border-b border-gray-700 my-6"></div>

            <div className="flex flex-wrap gap-4 sm:gap-8">
              <div className="flex flex-col gap-1">
                <div className="uppercase text-xs text-gray-400">Mint Ends</div>
                <div className="text-3xl">
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
                <div className="text-3xl">
                  {`${formatUnits(rewards || 0, 18).slice(0, 7)}Ξ`}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="uppercase text-xs text-gray-400">
                  Total Mints
                </div>
                <div className="text-3xl">{mints}</div>
              </div>
            </div>
          </div>
          {displayToken && <MintButton token={displayToken} />}
        </div>
      </div>
    </div>
  );
};
