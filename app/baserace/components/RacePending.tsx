"use client";

import { MintButton } from "@/app/baserace/components/MintButton";
import { formatUnits } from "ethers";
import { useAccount } from "wagmi";
import { useEntriesForAddress } from "@/app/lib/hooks/baserace/useEntriesForAddress";
import { CountDown } from "@/app/lib/components/client/CountDown";
import { BaseRace } from "@/app/lib/types/types";

interface Props {
  mintTime: number;
  price: string;
  race: BaseRace;
}

export const RacePending = ({ mintTime, price, race }: Props) => {
  const { address, isConnected } = useAccount();

  const prize = race ? `${formatUnits(race?.prize, 18).slice(0, 7)}Ξ` : "";
  const { data: userEntries } = useEntriesForAddress({
    address,
    id: race.id,
    enabled: isConnected,
  });

  return (
    <div className="grid grid-cols-4 w-full p-6 bg-black rounded-lg text-white h-[210px]">
      <div className="col-span-3 flex flex-col justify-between h-full">
        <div>
          <div className="text-4xl mb-2">BaseRace #{race.id}</div>
          <div className="text-sm">Unliminted entries. Mint ends in XXX</div>
        </div>
        <div>
          <MintButton mintPrice={price} />
        </div>
      </div>

      <div className="bg-blue-600 rounded-lg p-3">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div>Prize {prize}</div>
            <div>Entries {race.entries}</div>
            <div className="flex flex-row gap-2">
              <div>Starts in</div>
              <CountDown hour={20} />
            </div>
          </div>

          {address && userEntries && (
            <div>Your entries: {userEntries.length}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RaceUpcomingSkeleton = () => {
  return (
    <div className="grid grid-cols-4 w-full p-6 bg-black rounded-lg bg-opacity-30 animate-pulse h-[210px]">
      <div className="col-span-3 justify-between">
        <div className="flex flex-col justify-between h-full"></div>
      </div>
      <div className="bg-black bg-opacity-30 rounded-lg"></div>
    </div>
  );
};
