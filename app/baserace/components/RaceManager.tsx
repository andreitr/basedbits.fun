"use client";

import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { BaseRace } from "@/app/lib/types/types";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";

interface Props {
    race: BaseRace;
    lapTime: number;
}

const LAP_INTERVAL = 300; // New lap starts every 5 minutes

export const RaceManager = ({ race, lapTime }: Props) => {
    const [currentLapEndTime, setCurrentLapEndTime] = useState<number>(
        race.lapCount * LAP_INTERVAL
    );
    const queryClient = useQueryClient();

    const { data: currentRace } = useRace({
        id: race.id,
        enabled: true,
        refetchInterval: 3000, // Refetch every 3 seconds
    });

    useEffect(() => {
        if (currentRace && currentRace.lapCount > race.lapCount) {
            // New lap has started, invalidate the race query
            queryClient.invalidateQueries({ queryKey: ["race", race.id] });
        }
    }, [currentRace, race.lapCount, race.id, queryClient]);

    useEffect(() => {
        const now = DateTime.now().toSeconds();
        const timeUntilNextLap = currentLapEndTime - now;

        if (timeUntilNextLap <= 0) {
            setCurrentLapEndTime((prev) => prev + LAP_INTERVAL);
        }
    }, [currentLapEndTime]);

    return (
        <CountDownToDate
            targetDate={currentLapEndTime}
            message={` Lap ended. Next lap starts at ${DateTime.fromSeconds(currentLapEndTime + LAP_INTERVAL).toFormat("h:mm a")}`}
        />
    );
}; 