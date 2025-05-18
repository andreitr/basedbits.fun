"use client";

import { AeyeTokenMetadata } from "@/app/lib/api/aeye/getTokenMetadata";
import { useCurrentMint } from "@/app/lib/hooks/aeye/useCurrentMint";
import Image from "next/image";

export const MintComponent = ({ metadata }: { metadata: AeyeTokenMetadata }) => {

  const { data: currentMint, isLoading } = useCurrentMint({ enabled: true });

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-gray-900 rounded-lg p-6 text-white">
      <div className="flex flex-row gap-4">
        <div>
        <div className="text-3xl mb-4 uppercase">{metadata.name}</div>
        <div>
        {metadata.description}
      
        </div>
        </div>
          <Image  className="rounded-lg"
          src={metadata.image} alt="AEYE" width={300} height={300} />
      </div>
    </div>
  );
};
