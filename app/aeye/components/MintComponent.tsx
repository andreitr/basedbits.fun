"use client";

import { AeyeTokenMetadata } from "@/app/lib/api/aeye/getTokenMetadata";
import { useCurrentMint } from "@/app/lib/hooks/aeye/useCurrentMint";
import { useTokenMetadata } from "@/app/lib/hooks/aeye/useTokenMetadata";
import Image from "next/image";

export const MintComponent = ({ token }: { token?: AeyeTokenMetadata }) => {
  
  const { data: currentMint, isLoading } = useCurrentMint({ enabled: true });
  const { data: loadedTokenMeta } = useTokenMetadata({
    tokenId: currentMint,
    enabled: !token && !!currentMint
  });

  const displayToken = token || loadedTokenMeta;

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-gray-900 rounded-lg p-6 text-white">
      <div className="flex flex-row gap-4">
        <div>
          <div className="text-3xl mb-4 uppercase">{displayToken?.name}</div>
          <div>
            {displayToken?.description}
          </div>
        </div>
        <Image 
          className="rounded-lg"
          src={displayToken?.image || ''} 
          alt="AEYE" 
          width={300} 
          height={300} 
        />
      </div>
    </div>
  );
};
