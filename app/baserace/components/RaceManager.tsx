"use client";

import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { BASE_RACE_QKS } from "@/app/lib/constants";
import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { BaseRace, BaseRaceLap } from "@/app/lib/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

interface Props {
    race: BaseRace;
    lapTime: number;
    lap: BaseRaceLap;
}

const LAP_INTERVAL = 300;

export const RaceManager = ({ race, lapTime, lap }: Props) => {

    const [shouldRefetch, setShouldRefetch] = useState(false);
    const queryClient = useQueryClient();

    const { data: currentRace } = useRace({
        id: race.id,
        enabled: true,
        refetchInterval: shouldRefetch ? 3000 : undefined,
    });

    useEffect(() => {
        if (currentRace && currentRace.lapCount > lap.id) {
            //TODO: Verify that this reloads upstream lap queries
            queryClient.invalidateQueries({
                queryKey: [BASE_RACE_QKS.RACE, race.id],
            });
            setShouldRefetch(false);
        }
    }, [currentRace, race.lapCount, race.id, queryClient]);

    useEffect(() => {
        if (lap.startedAt + LAP_INTERVAL > DateTime.now().toSeconds()) {
            setShouldRefetch(true);
        }
    }, [lap]);

    return (
        <CountDownToDate
            targetDate={lap.startedAt + lapTime}
            message={` Lap ended. Next lap starts at ${DateTime.fromSeconds(lap.startedAt + LAP_INTERVAL).toFormat("h:mm a")}`}
        />
    );
};
