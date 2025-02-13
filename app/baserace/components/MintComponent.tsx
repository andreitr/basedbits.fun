"use client";

import Image from "next/image";
import { MintButton } from "@/app/baserace/components/MintButton";
import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { AirdropTimer } from "@/app/lib/components/client/AirdropTimer";

interface Props {
  id: number;
  price: string;
}

export const MintComponent = ({ id, price }: Props) => {
  const { data: race } = useRace({ id, enabled: true });

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black bg-opacity-90 text-white rounded-lg p-6">
      <div className="flex flex-col justify-between">
        <div>
          <div className="text-5xl mb-2 text-[#82BCFC]">Base Race {id}</div>
          <div>
            Race starts in <AirdropTimer />. Survive 6 laps, use boosts
            strategically, and compete to win the prize pool.
          </div>
        </div>
        <div>
          <MintButton mintPrice={price} />

          <div className="text-sm text-[#82BCFC] mt-5">
            80% of proceeds go to the prize pool; 20% are burned via BBITS.
          </div>
        </div>
      </div>
      <div>
        <Image
          className="rounded-lg"
          src={"/images/race.svg"}
          alt="Preview"
          width="540"
          height="540"
        />
      </div>
    </div>
  );
};
