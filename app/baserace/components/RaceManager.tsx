"use client";

import { IBaseRace } from "@/app/lib/classes/BaseRace";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";

interface Props {
  race: IBaseRace;
  lapTime: number;
  lapStartedAt: number;
}

const LAP_INTERVAL = 300;

export const RaceManager = ({ race, lapTime, lapStartedAt }: Props) => {
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
      setShouldRefetch(false);
      initialLapCount.current = currentRace.lapCount;
    }
  }, [shouldRefetch, currentRace, race.id, queryClient]);

  useEffect(() => {
    const checkLapEnd = () => {
      if (lapStartedAt + lapTime > DateTime.now().toSeconds()) {
        setShouldRefetch(true);
      }
    };
    checkLapEnd();
    const interval = setInterval(checkLapEnd, 3000);
    return () => clearInterval(interval);
  }, [lapStartedAt, lapTime]);

  return (
    <CountDownToDate
      targetDate={lapStartedAt + lapTime}
      message={` Lap ended. Next lap starts at ${DateTime.fromSeconds(lapStartedAt + LAP_INTERVAL).toFormat("h:mm a")}`}
    />
  );
};
