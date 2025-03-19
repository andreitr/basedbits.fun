"use client";

import { RaceSkeleton } from "@/app/baserace/components/RaceSkeleton";
import { Racers } from "@/app/baserace/components/Racers";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useEntriesForAddress } from "@/app/lib/hooks/baserace/useEntriesForAddress";
import { useLap } from "@/app/lib/hooks/baserace/useLap";
import { BaseRace, BaseRaceEntry } from "@/app/lib/types/types";
import { formatUnits } from "ethers";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface Props {
  race: BaseRace;
}

export const RaceLive = ({ race }: Props) => {
  const prize = `${formatUnits(race?.prize, 18).slice(0, 7)}Ξ`;
  const { address, isConnected } = useAccount();

  const nextMint = DateTime.utc()
    .set({ hour: 20, minute: 0 })
    .toFormat("h:mm a");

  const { data: userEntries } = useEntriesForAddress({
    address,
    id: race.id,
    enabled: isConnected,
  });

  const { data: lap } = useLap({
    raceId: race.id,
    lapId: race.lapCount,
    enabled: true,
    refetchInterval: 1000 * 3,
  });

  const [allRacers, setAllRacers] = useState<BaseRaceEntry[]>([]);
  const [userRacers, setUserRacers] = useState<BaseRaceEntry[]>([]);

  useEffect(() => {
    if (lap) {
      const filtered = lap?.positions.map((tokenId, index) => ({
        tokenId: Number(tokenId),
        index,
      }));
      setAllRacers(filtered);
    }
  }, [lap]);

  useEffect(() => {
    if (userEntries && allRacers.length > 0) {

      const userEntryObjects = userEntries.map((tokenId) => ({
        tokenId: Number(tokenId),
        index: allRacers.findIndex(
          (racer) => racer.tokenId === Number(tokenId),
        ),
      }));

      const myRacers = allRacers.filter((racer) =>
        userEntryObjects.some((entry) => entry.tokenId === racer.tokenId),
      );
      setUserRacers(myRacers);
    }
  }, [userEntries, allRacers]);

  if (!lap || !allRacers) return <RaceSkeleton />;

  return (
    <div>
      <div className="grid grid-cols-4 w-full p-6 bg-black rounded-lg text-white h-[210px]">
        <div className="col-span-3 flex flex-col justify-between h-full">
          <div>
            <div className="text-4xl mb-2">BaseRace #{race.id} is LIVE</div>
            <div className="text-sm">
              A new race starts daily! Survive {race.lapTotal} laps and fight
              for the prize pool
            </div>
          </div>

          <div className="text-sm text-gray-300">
            The next BaseRace opens for registration at {nextMint}
          </div>
        </div>

        <div className="bg-blue-600 rounded-lg p-3">
          <div className="flex flex-col justify-between h-full">
            <div>
              <div>Prize {prize}</div>
              <div>Entries {race.entries}</div>
              <div>
                Lap {race.lapCount} of {race.lapTotal}
              </div>
            </div>

            {address && userEntries && (
              <div>Your entries: {userEntries.length}</div>
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-4 my-8 gap-8 ">
          <div className="col-span-3 flex flex-col gap-4">
            <div className="flex flex-row items-center text-xs uppercase">
              All Racers -
              <CountDownToDate
                targetDate={lap.startedAt + 180}
                message={` Lap ended. Next lap starts at ${DateTime.fromSeconds(lap.startedAt + 120).toFormat("h:mm a")}`}
              />
            </div>
            <Racers
              race={race}
              entries={allRacers}
              eliminated={lap.eliminations}
              userEntries={
                userEntries
                  ? userEntries.map((tokenId) => ({
                    tokenId: Number(tokenId),
                    index: allRacers.findIndex(
                      (racer) => racer.tokenId === Number(tokenId),
                    ),
                  }))
                  : []
              }
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-xs uppercase">My Racers</div>
            <Racers
              entries={userRacers}
              eliminated={lap.eliminations}
              userEntries={
                userEntries
                  ? userEntries.map((tokenId) => ({
                    tokenId: Number(tokenId),
                    index: allRacers.findIndex(
                      (racer) => racer.tokenId === Number(tokenId),
                    ),
                  }))
                  : []
              }
              race={race}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
