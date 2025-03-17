"use client";

import { MintButton } from "@/app/baserace/components/MintButton";
import { Racers } from "@/app/baserace/components/Racers";
import { CountDown } from "@/app/lib/components/client/CountDown";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useEntriesForAddress } from "@/app/lib/hooks/baserace/useEntriesForAddress";
import { useLap } from "@/app/lib/hooks/baserace/useLap";
import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { BaseRace, BaseRaceEntry } from "@/app/lib/types/types";
import { formatUnits } from "ethers";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface Props {
  mintTime: number;
  mintPrice: string;
  race: BaseRace;
}

export const RacePending = ({ mintTime, mintPrice: price, race }: Props) => {
  const { address, isConnected } = useAccount();

  const isMinting = race.startedAt + mintTime > DateTime.now().toSeconds();

  const { data: loadedRace } = useRace({
    id: race.id,
    enabled: true,
  });

  const { data: userEntries } = useEntriesForAddress({
    address,
    id: race.id,
    enabled: isConnected,
  });

  const { data: lap } = useLap({
    raceId: race.id,
    lapId: race.lapCount,
    enabled: true,
  });

  const nextMint = DateTime.utc()
    .set({ hour: 20, minute: 0 })
    .toFormat("h:mm a");

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
    if (lap && userEntries && allRacers.length > 0) {
      const myRacers = allRacers.filter((racer) =>
        userEntries.includes(racer.tokenId.toString()),
      );
      setUserRacers(myRacers);
    }
  }, [lap, userEntries, allRacers]);

  const currentRace = loadedRace || race;
  const raceStartTime = DateTime.utc().set({ hour: 19, minute: 0 });
  const raceStartsAt = `${raceStartTime.toLocal().toFormat("h:mma").toLowerCase()} ${raceStartTime.toLocal() > DateTime.now() ? "today" : "tomorrow"}`;

  const raceTitle = isMinting
    ? `BaseRace #${currentRace.id} Registration Open`
    : `BaseRace #${currentRace.id} - Starts soon`;

  return (
    <div>
      <div className="grid grid-cols-4 w-full p-6 bg-black rounded-lg text-white h-[210px]">
        <div className="col-span-3 flex flex-col justify-between h-full">
          <div>
            <div className="text-4xl mb-2">{raceTitle}</div>
            <div className="text-sm">
              {isMinting ? (
                <div className="flex flex-row gap-2 items-center">
                  Registration for this race closes in
                  <CountDownToDate
                    message="Mint ended"
                    targetDate={race.startedAt + mintTime}
                  />{" "}
                  - Race starts {raceStartsAt}
                </div>
              ) : (
                <div className="flex flex-row gap-2 items-center">
                  {"Registration closed! Race starts in "}
                  <CountDown hour={19} />
                </div>
              )}
            </div>
          </div>
          {isMinting ? (
            <MintButton mintPrice={price} race={currentRace} />
          ) : (
            <div className="text-xs text-gray-300">
              The next BaseRace opens for registration once this one ends
            </div>
          )}
        </div>

        <div className="bg-blue-600 rounded-lg p-3">
          <div className="flex flex-col justify-between h-full">
            <div>
              <div>
                Prize {`${formatUnits(currentRace.prize, 18).slice(0, 7)}Ξ`}
              </div>
              <div>Entries {currentRace.entries}</div>
              <div className="flex flex-row gap-2">
                <div>Starts {raceStartsAt}</div>
              </div>
            </div>

            {address && userEntries && (
              <div>Your entries: {userEntries.length}</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 my-8 gap-8 ">
        {lap && allRacers.length > 0 && (
          <div className="col-span-3 flex flex-col gap-4">
            <div className="text-xs uppercase">All Racers</div>
            <Racers
              race={currentRace}
              entries={allRacers}
              eliminated={lap.eliminations}
              userEntries={userRacers}
            />
          </div>
        )}
        {lap && userRacers.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="text-xs uppercase">My Racers</div>
            <Racers
              race={currentRace}
              entries={userRacers}
              eliminated={lap.eliminations}
              userEntries={userRacers}
            />
          </div>
        )}
      </div>
    </div>
  );
};
