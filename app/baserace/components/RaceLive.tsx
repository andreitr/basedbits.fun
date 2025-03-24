"use client";

import { RaceSkeleton } from "@/app/baserace/components/RaceSkeleton";
import { Racers } from "@/app/baserace/components/Racers";
import { IBaseRace } from "@/app/lib/classes/BaseRace";
import { useEntriesForAddress } from "@/app/lib/hooks/baserace/useEntriesForAddress";
import { useLap } from "@/app/lib/hooks/baserace/useLap";
import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { BaseRaceEntry } from "@/app/lib/types/types";
import { formatUnits } from "ethers";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface Props {
  race: IBaseRace;
  lapTime: number;
}

export const RaceLive = ({ race, lapTime }: Props) => {
  const prize = `${formatUnits(race?.prize, 18).slice(0, 7)}Ξ`;

  const { address, isConnected } = useAccount();

  const { data: loadedRace } = useRace({
    id: race.id,
    enabled: true,
  });

  const { data: userEntries } = useEntriesForAddress({
    address,
    id: race.id,
    enabled: isConnected,
  });

  const { data: lap } = useLap({
    raceId: race.id,
    lapId: race.lapCount,
    enabled: true,
    refetchInterval: 1000 * 3,
  });

  const currentRace = loadedRace || race;
  const [allRacers, setAllRacers] = useState<BaseRaceEntry[]>([]);

  useEffect(() => {
    if (lap?.id === race.lapCount) {
      const filtered = lap?.positions.map((tokenId, index) => ({
        tokenId: Number(tokenId),
        index,
      }));

      console.log("new lap detected");

      setAllRacers(filtered);
    }
  }, [race.lapCount, lap]);

  if (!lap || !allRacers) return <RaceSkeleton />;

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
      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 my-6 md:my-8 gap-6 md:gap-8">
          <div className="col-span-1 md:col-span-3 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center text-xs uppercase">
              All Racers
            </div>
            <Racers
              race={currentRace}
              entries={allRacers}
              eliminated={lap.eliminations}
              userEntries={
                userEntries
                  ? userEntries.map((tokenId) => ({
                      tokenId: Number(tokenId),
                      index: allRacers.findIndex(
                        (racer) => racer.tokenId === Number(tokenId),
                      ),
                    }))
                  : []
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
