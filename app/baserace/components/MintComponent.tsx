"use client";

import Image from "next/image";
import { MintButton } from "@/app/baserace/components/MintButton";
import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { CountDownTimer } from "@/app/lib/components/client/CountDownTimer";
import { formatUnits } from "ethers";

interface Props {
  id: number;
  price: string;
}

export const MintComponent = ({ id, price }: Props) => {
  // 81000
  // Mint time
  const { data: race } = useRace({ id, enabled: true });

  const prize = race ? `${formatUnits(race?.prize, 18).slice(0, 7)}Ξ` : "";

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black bg-opacity-90 text-white rounded-lg p-6">
      <div className="flex flex-col justify-between">
        <div>
          <div className="text-5xl mb-2 text-[#82BCFC]">
            Race in <CountDownTimer hour={19} />
          </div>
          <div>
            Survive 6 laps, use boosts strategically, and compete to win the{" "}
            {prize} prize pool
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
          width="400"
          height="400"
        />
      </div>
    </div>
  );
};
