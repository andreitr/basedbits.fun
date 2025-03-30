"use client";

import { Racers } from "@/app/baserace/components/Racers";
import { IBaseRace } from "@/app/lib/classes/BaseRace";
import { BaseRaceEntry } from "@/app/lib/types/types";
import { useLap } from "@/app/lib/hooks/baserace/useLap";
import { useEffect, useState } from "react";

interface Props {
  race: IBaseRace;
  userEntries?: BaseRaceEntry[];
}

export const RaceLivePositions = ({ race, userEntries }: Props) => {
  const [allRacers, setAllRacers] = useState<BaseRaceEntry[]>([]);

  const { data: lap } = useLap({
    raceId: race.id,
    lapId: race.lapCount,
    enabled: true,
    refetchInterval: 1000 * 3,
  });

  useEffect(() => {
    if (lap?.positions) {
      const filtered = lap.positions.map((tokenId, index) => ({
        tokenId: Number(tokenId),
        index,
      }));
      setAllRacers(filtered);
    }
  }, [lap]);

  if (!lap || !allRacers) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 my-6 md:my-8 gap-6 md:gap-8">
      <div className="col-span-1 md:col-span-3 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center text-xs uppercase">
          All Racers
        </div>
        <Racers
          race={race}
          entries={allRacers}
          eliminated={lap.eliminations}
          userEntries={userEntries}
        />
      </div>
    </div>
  );
};
