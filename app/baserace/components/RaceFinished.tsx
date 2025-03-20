"use client";

import { RaceSkeleton } from "@/app/baserace/components/RaceSkeleton";
import { Racers } from "@/app/baserace/components/Racers";
import { useLap } from "@/app/lib/hooks/baserace/useLap";
import { BaseRace, BaseRaceEntry } from "@/app/lib/types/types";
import { formatUnits } from "ethers";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

interface Props {
  race: BaseRace;
}

export const RaceFinished = ({ race }: Props) => {
  const prize = `${formatUnits(race?.prize, 18).slice(0, 7)}Ξ`;

  const { data: lap } = useLap({
    raceId: race.id,
    lapId: 1, //First lap with all entries
    enabled: true,
  });

  const [allRacers, setAllRacers] = useState<BaseRaceEntry[]>([]);

  useEffect(() => {
    if (lap) {
      const filtered = lap?.positions.map((tokenId, index) => ({
        tokenId: Number(tokenId),
        index,
      }));
      setAllRacers(filtered);
    }
  }, [lap]);

  if (!lap || !allRacers) return <RaceSkeleton />;

  return (
    <div>
      <div className="grid grid-cols-4 w-full p-6 bg-black rounded-lg text-white h-[210px]">
        <div className="col-span-3 flex flex-col justify-between h-full">
          <div>
            <div className="text-4xl mb-2">BaseRace #{race.id} is FINISHED</div>
            <div className="text-sm">
              Winner: {race.winner} won {prize}
            </div>
          </div>

          <div className="text-sm text-gray-300">
            The next BaseRace opens for registration.
          </div>
        </div>

        <div className="bg-blue-600 rounded-lg p-3">
          <div className="flex flex-col justify-between h-full">
            <div>
              <div>Prize {prize}</div>
              <div>Entries {race.entries}</div>
              <div>Completed {race.lapCount} laps</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-col my-8 gap-8">
          <div className="flex flex-row items-center text-xs uppercase">
            Final Results
          </div>
          <Racers race={race} entries={allRacers} />
        </div>
      </div>
    </div>
  );
};
