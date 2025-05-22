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
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-gray-900 rounded-lg p-6 text-white">
      <div className="flex flex-col sm:flex-row gap-4">
        <Image
          className="rounded-lg w-full sm:w-[300px] h-auto sm:h-[300px]"
          src={displayToken?.image || ""}
          alt={displayToken?.headline || ""}
          width={300}
          height={300}
        />
        <div className="flex flex-col-reverse sm:flex-col justify-between gap-10">
          <div>
            <div className="flex flex-wrap gap-4 sm:gap-8">
              <div className="flex flex-col gap-2">
                <div className="uppercase text-xs">Mint Ends</div>
                <div className="text-2xl">
                  <CountDown hour={20} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="uppercase text-xs">Community Rewards</div>
                <div className="text-2xl">
                  {`${formatUnits(rewards || 0, 18).slice(0, 7)}Ξ`}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="uppercase text-xs">Total Mints</div>
                <div className="text-2xl">{mints}</div>
              </div>
            </div>
          </div>
          {displayToken && <MintButton token={displayToken} />}
        </div>
      </div>
    </div>
  );
};
