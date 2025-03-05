"use client";

import { BaseRace, BaseRaceEntry } from "@/app/lib/types/types";
import { useLap } from "@/app/lib/hooks/baserace/useLap";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { formatUnits } from "ethers";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useEntriesForAddress } from "@/app/lib/hooks/baserace/useEntriesForAddress";
import { RaceSkeleton } from "@/app/baserace/components/RaceSkeleton";
import { Racers } from "@/app/baserace/components/Racers";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useBoost } from "@/app/lib/hooks/baserace/useBoost";

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

  const { call: boost, data } = useBoost();

  console.log(lap?.eliminations);

  const { isFetching: isBoosting, isSuccess: hasBoosted } =
    useWaitForTransactionReceipt({
      hash: data,
    });
  const [boostedTokenId, setBoostedTokenId] = useState<string | null>(null);

  useEffect(() => {
    if (lap && userEntries) {
      const filtered = lap?.positions.map((tokenId, index) => ({
        tokenId: Number(tokenId),
        index,
      }));

      const myRacers = filtered.filter((racer) =>
        userEntries.includes(racer.tokenId.toString()),
      );

      setUserRacers(myRacers);
      setAllRacers(filtered);
    }

    // TODO: Figure out how to speed up the racer
    // if (hasBoosted) {
    //     setAllRacers((prevRacers) => {
    //         const newRacers = [...prevRacers];
    //         const index = newRacers.findIndex((racer) => racer.tokenId.toString() === boostedTokenId);
    //         if (index > -1) {
    //             const [clickedItem] = newRacers.splice(index, 1);
    //             newRacers.unshift(clickedItem);
    //             newRacers.forEach((racer, idx) => {
    //                 racer.index = idx;
    //             });
    //         }
    //         return newRacers;
    //     });
    // }
  }, [lap, userEntries]);

  const handleClick = (tokenId: number) => {
    setBoostedTokenId(tokenId.toString());
    boost(tokenId.toString());
  };

  if (!lap || allRacers.length === 0) return <RaceSkeleton />;

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
                targetDate={lap.startedAt + 300}
                message={` Lap ended. Next lap starts at ${DateTime.fromSeconds(lap.startedAt + 600).toFormat("h:mm a")}`}
              />
            </div>
            <Racers
              onClick={handleClick}
              race={race}
              entries={allRacers}
              eliminated={lap.eliminations}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-xs uppercase">My Racers</div>
            <Racers
              onClick={handleClick}
              entries={userRacers}
              eliminated={lap.eliminations}
              race={race}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
