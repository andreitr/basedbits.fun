"use client";

import { useAeyeById } from "@/app/lib/hooks/aeye/useAeyeById";
import { useCurrentMint } from "@/app/lib/hooks/aeye/useCurrentMint";
import { useTokenMetadata } from "@/app/lib/hooks/aeye/useTokenMetadata";
import { DBAeye } from "@/app/lib/types/types";
import Image from "next/image";
import { MintButton } from "./MintButton";

export const MintComponent = ({ token }: { token?: DBAeye }) => {
  
  const { data: currentMint } = useCurrentMint({ enabled: true });
  const { data: loadedTokenMeta } = useAeyeById({
    id: currentMint,
    enabled: !token && !!currentMint
  });

  const displayToken = token || loadedTokenMeta;

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-gray-900 rounded-lg p-6 text-white">
      <div className="flex flex-row gap-4">
        <div className="flex flex-col justify-between">
          <div>
            <div className="text-3xl mb-4 uppercase">{displayToken?.headline}</div>
            <div>
              {displayToken?.lede}
            </div>
          </div>
          <MintButton />
        </div>
        <Image 
          className="rounded-lg"
          src={displayToken?.image || ''} 
          alt={displayToken?.headline || ''} 
          width={300} 
          height={300} 
        />
      </div>
    </div>
  );
};
