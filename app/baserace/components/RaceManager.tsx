"use client";

import { IBaseRace } from "@/app/lib/classes/BaseRace";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  race: IBaseRace;
}

enum RaceState {
  MINT_OPEN = "minting_open",
  MINT_FINISHED = "mint_finished",
  LIVE = "live",
  RACE_ENDED = "race_ended",
}

const RACE_START_UTC = 19;
const LAP_INTERVAL = 300;
const LAP_DURATION = 180;
const MINTING_TIME = 79200;

export const RaceManager = ({ race }: Props) => {
  const [state, setState] = useState<RaceState | null>(null);
  const [lastLapCount, setLastLapCount] = useState<number>(race.lapCount);
  const router = useRouter();

  const { data: fetchedRace } = useRace({
    id: race.id,
    enabled: true,
    refetchInterval: state === RaceState.LIVE ? 1000 * 3 : undefined,
  });

  const currentRace = fetchedRace || race;

  const determineRaceState = () => {
    const now = DateTime.now().toUTC();
    const mintEndTime = DateTime.fromSeconds(
      race.startedAt + MINTING_TIME,
    ).toUTC();
    const raceStartTime = DateTime.fromSeconds(race.startedAt)
      .toUTC()
      .set({ hour: RACE_START_UTC });

    const isRaceMinting =
      now < mintEndTime &&
      race.startedAt > 0 &&
      race.endedAt === 0 &&
      race.lapCount === 0;
    const isRaceMintFinished = now >= mintEndTime && now < raceStartTime;
    const isRaceLive =
      now >= raceStartTime &&
      race.startedAt > 0 &&
      race.endedAt === 0 &&
      race.lapCount > 0;
    const isRaceEnded =
      race.startedAt > 0 && race.endedAt > 0 && race.winner === 0;

    if (isRaceMinting) {
      return RaceState.MINT_OPEN;
    } else if (isRaceMintFinished) {
      return RaceState.MINT_FINISHED;
    } else if (isRaceLive) {
      return RaceState.LIVE;
    } else if (isRaceEnded) {
      return RaceState.RACE_ENDED;
    }
    return null;
  };

  useEffect(() => {
    if (currentRace.lapCount > lastLapCount) {
      setLastLapCount(currentRace.lapCount);
      router.refresh();
    }
  }, [currentRace.lapCount, lastLapCount, router]);

  useEffect(() => {
    setState(determineRaceState());

    const interval = setInterval(() => {
      setState(determineRaceState());
    }, 3000);

    return () => clearInterval(interval);
  }, [currentRace]);

  // Watch for state changes and refresh when LIVE
  useEffect(() => {
    if (state === RaceState.LIVE) {
      router.push(`/baserace/${race.id}`);
    }
    if (state === RaceState.RACE_ENDED) {
      router.refresh();
    }
  }, [state, race.id, router]);

  if (state === RaceState.LIVE) {
    return (
      <div className="flex flex-row gap-2">
        <div>LIVE</div>
        <CountDownToDate
          targetDate={race.startedAt + MINTING_TIME}
          message={`Minting now open`}
        />
      </div>
    );
  }

  if (state === RaceState.MINT_OPEN) {
    return (
      <div className="flex flex-row gap-2">
        <div>Entries are minting. Mint ends in:</div>
        <CountDownToDate
          targetDate={race.startedAt + MINTING_TIME}
          message={`Minting now open`}
        />
      </div>
    );
  }

  if (state === RaceState.MINT_FINISHED) {
    return (
      <div className="flex flex-row gap-2">
        <div>Minting finished. Race starts at:</div>
        <CountDownToDate
          targetDate={DateTime.fromSeconds(race.startedAt)
            .toUTC()
            .set({ hour: RACE_START_UTC })
            .toSeconds()}
          message={`Race starting soon...`}
        />
      </div>
    );
  }

  return <div> </div>;
};
