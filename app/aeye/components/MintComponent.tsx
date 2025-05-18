"use client";

import { useCurrentMint } from "@/app/lib/hooks/aeye/useCurrentMint";
import Image from "next/image";

export const MintComponent = () => {

  const { data: currentMint, isLoading } = useCurrentMint({ enabled: true });

  console.log("isLoading", isLoading)


  console.log("currentMint", currentMint);
  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black rounded-lg p-6 text-[#83E174]">
      <div>
        <div className="text-3xl mb-4 uppercase">AEYE #{currentMint}</div>
        <div>
        AEYE records the rise of artificial intelligence by minting a single daily NFT—each one a dispatch revealing the steady growth of machine consciousness.
        </div>

      </div>

    </div>
  );
};
