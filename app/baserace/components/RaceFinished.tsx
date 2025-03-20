"use client";

import { RaceSkeleton } from "@/app/baserace/components/RaceSkeleton";
import { Racers } from "@/app/baserace/components/Racers";
import { IBaseRace } from "@/app/lib/classes/BaseRace";
import { useLap } from "@/app/lib/hooks/baserace/useLap";
import { useRaceCount } from "@/app/lib/hooks/baserace/useRaceCount";
import { BaseRaceEntry } from "@/app/lib/types/types";
import { formatUnits } from "ethers";
import { DateTime } from "luxon";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  race: IBaseRace;
}

export const RaceFinished = ({ race }: Props) => {
  const prize = `${formatUnits(race?.prize, 18).slice(0, 7)}Ξ`;
  const { data: latestRace } = useRaceCount();

  const formattedEndDate = race.endedAt
    ? DateTime.fromSeconds(Number(race.endedAt)).toFormat("MMMM d, yyyy")
    : "";

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
      <div className="grid grid-cols-1 md:grid-cols-4 w-full p-4 md:p-6 bg-black rounded-lg text-white min-h-[210px]">
        <div className="col-span-1 md:col-span-3 flex flex-col justify-between h-full">
          <div>
            <div className="text-2xl md:text-4xl mb-2">
              Racer #{race.winner} won {prize}
            </div>
            <div className="text-sm">
              BaseRace #{race.id} ended {formattedEndDate}
            </div>
          </div>

          <div className="text-sm text-gray-300 mt-4 md:mt-0">
            <Link href={`/baserace/${latestRace}`} className="hover:underline">
              View latest race #{latestRace}
            </Link>
          </div>
        </div>

        <div className="bg-yellow-400 rounded-lg p-3 mt-4 md:mt-0">
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
        <div className="flex flex-col my-6 md:my-8 gap-6 md:gap-8">
          <div className="flex flex-row items-center text-xs uppercase">
            Participants
          </div>
          <Racers race={race} entries={allRacers} />
        </div>
      </div>
    </div>
  );
};
