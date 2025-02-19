"use client";

import { BaseRace } from "@/app/lib/types/types";
import { useLap } from "@/app/lib/hooks/baserace/useLap";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";

interface Props {
  race: BaseRace;
}

export const RaceLive = ({ race }: Props) => {
  const { data: lap, isLoading } = useLap({
    raceId: race.id,
    lapId: race.currentLap,
    enabled: true,
  });

  if (isLoading || !lap) return <div>Loading...</div>;

  return (
    <div>
      <div>Lap {race.currentLap}</div>
      <div>Lap {lap.positions}</div>
      <div>
        Lap Ends{" "}
        <CountDownToDate
          targetDate={lap.startedAt + 600}
          message={"Lap ended"}
        />
      </div>
    </div>
  );
};
