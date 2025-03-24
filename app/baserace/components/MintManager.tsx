"use client";

import { IBaseRace } from "@/app/lib/classes/BaseRace";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { futureLocalTime } from "@/app/lib/utils/timeUtils";
import { CountDown } from "@/app/lib/components/client/CountDown";

interface Props {
    race: IBaseRace;
    mintTime: number;
}

export const MintManager = ({ race, mintTime }: Props) => {
    const initialLapCount = useRef(race.lapCount);
    const router = useRouter();
    const [shouldRefetch, setShouldRefetch] = useState(false);

    const { data: currentRace } = useRace({
        id: race.id,
        enabled: true,
        refetchInterval: shouldRefetch ? 3000 : undefined,
    });

    const isMinting = race.startedAt + mintTime > DateTime.now().toSeconds();
    const isAboutToStart = DateTime.now().hour >= 19;

    useEffect(() => {
        if (shouldRefetch && currentRace && currentRace.lapCount > initialLapCount.current) {
            console.log("new race detected - resetting URL");
            router.push(`/baserace/${currentRace.id}`);
        }
    }, [shouldRefetch, currentRace, router]);

    useEffect(() => {
        const checkRaceStart = () => {
            if (DateTime.now().hour >= 19) {
                setShouldRefetch(true);
                console.log("mint ended - checking for race start");
            }
        };
        checkRaceStart();
        const interval = setInterval(checkRaceStart, 3000);
        return () => clearInterval(interval);
    }, []);

    if (isAboutToStart) {
        return (
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                Race is about to start. Hang tight!
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
            {isMinting ? (
                <>
                    Registration for this race closes in
                    <CountDownToDate
                        message="Mint ended"
                        targetDate={race.startedAt + mintTime}
                    />{" "}
                    - Race starts {DateTime.fromSeconds(race.startedAt + mintTime).toFormat("h:mm a")}
                </>
            ) : (
                <>
                    Registration closed! Race starts in{" "}
                    <CountDown hour={19} />
                </>
            )}
        </div>
    );
}; 