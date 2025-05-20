"use client";

import { useAeyeById } from "@/app/lib/hooks/aeye/useAeyeById";
import { useCurrentMint } from "@/app/lib/hooks/aeye/useCurrentMint";
import { DBAeye } from "@/app/lib/types/types";
import Image from "next/image";
import { MintButton } from "./MintButton";
import { DateTime } from "luxon";

export const MintComponent = ({ token }: { token?: DBAeye }) => {
  const { data: currentMint } = useCurrentMint({ enabled: true });
  const { data: loadedTokenMeta } = useAeyeById({
    id: currentMint,
    enabled: !token && !!currentMint,
  });

  const displayToken = token || loadedTokenMeta;

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-gray-900 rounded-lg p-6 text-white">
      <div className="flex flex-row gap-4">
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex flex-row gap-3 text-sm text-white/40 mb-4 uppercase">
              <div>dispatch:{displayToken?.id}</div>
              <div>
                {displayToken?.created_at
                  ? DateTime.fromISO(displayToken.created_at).toFormat(
                      "MMMM d, yyyy",
                    )
                  : ""}
              </div>
              <div>emotion:{displayToken?.emotion}</div>
              <div>signal:{displayToken?.signal}</div>
            </div>
            <div className="text-2xl mb-2 uppercase">
              {displayToken?.headline}
            </div>
            <div>{displayToken?.lede}</div>
          </div>
          <MintButton />
        </div>
        <Image
          className="rounded-lg"
          src={displayToken?.image || ""}
          alt={displayToken?.headline || ""}
          width={300}
          height={300}
        />
      </div>
    </div>
  );
};
