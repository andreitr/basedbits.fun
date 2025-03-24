"use client";

import { MintButton } from "@/app/baserace/components/MintButton";
import { Racers } from "@/app/baserace/components/Racers";
import { IBaseRace } from "@/app/lib/classes/BaseRace";
import { useEntriesForAddress } from "@/app/lib/hooks/baserace/useEntriesForAddress";
import { useLap } from "@/app/lib/hooks/baserace/useLap";
import { useRace } from "@/app/lib/hooks/baserace/useRace";
import { BaseRaceEntry } from "@/app/lib/types/types";
import { futureLocalTime } from "@/app/lib/utils/timeUtils";
import { formatUnits } from "ethers";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { RaceManager } from "./RaceManager";

interface Props {
  mintTime: number;
  mintPrice: string;
  race: IBaseRace;
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
  const raceStartsAt = futureLocalTime(19);

  const raceTitle = isMinting
    ? `BaseRace #${currentRace.id} Registration Open`
    : `BaseRace #${currentRace.id} - Starts soon`;

  return (
    <div>
      <RaceManager race={currentRace} />
      <div className="grid grid-cols-1 md:grid-cols-4 w-full p-4 md:p-6 bg-black rounded-lg text-white min-h-[210px]">
        <div className="col-span-1 md:col-span-3 flex flex-col justify-between h-full">
          <div>
            <div className="text-2xl md:text-4xl mb-2">{raceTitle}</div>
            <div className="text-sm">
              {/* <MintManager race={currentRace} mintTime={mintTime} /> */}
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

        <div className="bg-blue-600 rounded-lg p-3 mt-4 md:mt-0">
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

      <div className="grid my-6 md:my-8 gap-6 md:gap-8">
        {lap && allRacers.length > 0 && (
          <div className="col-span-1 md:col-span-3 flex flex-col gap-4">
            <div className="text-xs uppercase">All Racers</div>
            <Racers
              race={currentRace}
              entries={allRacers}
              eliminated={lap.eliminations}
              userEntries={userRacers}
            />
          </div>
        )}
      </div>
    </div>
  );
};
