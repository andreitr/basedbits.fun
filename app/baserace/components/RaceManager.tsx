"use client";

import { IBaseRace } from "@/app/lib/classes/BaseRace";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { BaseRaceLap } from "@/app/lib/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";

interface Props {
  race: IBaseRace;
  lapTime: number;
  lap: BaseRaceLap;
}

const LAP_INTERVAL = 300;

export const RaceManager = ({ race, lapTime, lap }: Props) => {
  const initialLapCount = useRef(race.lapCount);
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentRace } = useRace({
    id: race.id,
    enabled: true,
    refetchInterval: shouldRefetch ? 3000 : undefined,
  });

  useEffect(() => {
    if (
      shouldRefetch &&
      currentRace &&
      currentRace.lapCount > initialLapCount.current
    ) {
      console.log("we have a new lap - stop refetching");
      setShouldRefetch(false);
      initialLapCount.current = currentRace.lapCount;
    }
  }, [shouldRefetch, currentRace, race.id, queryClient]);

  useEffect(() => {
    const checkLapEnd = () => {
      if (DateTime.now().toSeconds() > lap.startedAt + LAP_INTERVAL) {
        setShouldRefetch(true);
        console.log("lap ended - checking for the next one ");
      }
    };
    checkLapEnd();
    const interval = setInterval(checkLapEnd, 3000);
    return () => clearInterval(interval);
  }, [lap, lapTime]);

  return (
    <CountDownToDate
      targetDate={lap.startedAt + lapTime}
      message={` Lap ended. Next lap starts at ${DateTime.fromSeconds(lap.startedAt + LAP_INTERVAL).toFormat("h:mm a")}`}
    />
  );
};
