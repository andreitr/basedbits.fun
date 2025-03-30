"use client";

import { RaceLivePositions } from "@/app/baserace/components/RaceLivePositions";
import { RaceSkeleton } from "@/app/baserace/components/RaceSkeleton";
import { IBaseRace } from "@/app/lib/classes/BaseRace";
import { useEntriesForAddress } from "@/app/lib/hooks/baserace/useEntriesForAddress";
import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { formatUnits } from "ethers";
import { useAccount } from "wagmi";

interface Props {
  race: IBaseRace;
}

export const RaceLive = ({ race }: Props) => {
  const prize = `${formatUnits(race?.prize, 18).slice(0, 7)}Ξ`;

  const { address, isConnected } = useAccount();

  const { data: loadedRace } = useRace({
    id: race.id,
    enabled: true,
    refetchInterval: 1000 * 5,
  });

  const { data: userEntries } = useEntriesForAddress({
    address,
    id: race.id,
    enabled: isConnected,
  });

  const currentRace = loadedRace || race;

  if (!currentRace) return <RaceSkeleton />;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 w-full p-4 md:p-6 bg-black rounded-lg text-white min-h-[210px]">
        <div className="col-span-1 md:col-span-3 flex flex-col justify-between h-full">
          <div>
            <div className="text-2xl md:text-4xl mb-2">
              BaseRace #{currentRace.id} is LIVE
            </div>
            <div className="text-sm">
              A new race starts daily! Survive {currentRace.lapTotal} laps and
              fight for the prize pool
            </div>
          </div>

          <div className="text-sm text-gray-300">
            The next BaseRace opens for registration...
          </div>
        </div>

        <div className="bg-blue-600 rounded-lg p-3 mt-4 md:mt-0">
          <div className="flex flex-col justify-between h-full">
            <div>
              <div>Prize {prize}</div>
              <div>Entries {currentRace.entries}</div>
              <div>
                Lap {currentRace.lapCount} of {currentRace.lapTotal}
              </div>
            </div>

            {address && userEntries && (
              <div>Your entries: {userEntries.length}</div>
            )}
          </div>
        </div>
      </div>
      <RaceLivePositions
        race={currentRace}
        userEntries={userEntries?.map((entry, index) => ({
          tokenId: parseInt(entry),
          index,
        }))}
      />
    </div>
  );
};
