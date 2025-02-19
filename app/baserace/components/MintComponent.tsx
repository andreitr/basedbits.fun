"use client";

import Image from "next/image";
import { MintButton } from "@/app/baserace/components/MintButton";
import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { formatUnits } from "ethers";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useAccount } from "wagmi";
import { useEntriesForAddress } from "@/app/lib/hooks/baserace/useEntriesForAddress";

interface Props {
  id: number;
  price: string;
  mintTime: number;
}

export const MintComponent = ({ id, price, mintTime }: Props) => {
  const { data: race } = useRace({ id, enabled: true });
  const { address, isConnected } = useAccount();

  const prize = race ? `${formatUnits(race?.prize, 18).slice(0, 7)}Ξ` : "";
  const { data } = useEntriesForAddress({ address, id, enabled: isConnected });

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black bg-opacity-90 text-white rounded-lg p-6">
      <div className="flex flex-col justify-between">
        <div>
          <div className="flex flex-row items-center text-5xl mb-2 text-[#82BCFC] gap-6">
            <div>Race #{id}</div>
            {race && (
              <CountDownToDate
                message={"Mint ended"}
                targetDate={race.startedAt + mintTime}
              />
            )}
          </div>
          <div>
            {race?.entries} racers competing for {prize}
          </div>
          <div>You minted {data?.length} entries.</div>
        </div>
        <MintButton mintPrice={price} />
      </div>
      <div>
        <Image
          className="rounded-lg"
          src={"/images/race.svg"}
          alt="Preview"
          width="200"
          height="200"
        />
      </div>
    </div>
  );
};
