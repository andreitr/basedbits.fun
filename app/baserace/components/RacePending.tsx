"use client";

import { MintButton } from "@/app/baserace/components/MintButton";
import { Racers } from "@/app/baserace/components/Racers";
import { CountDown } from "@/app/lib/components/client/CountDown";
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
  price: string;
  race: BaseRace;
}

export const RacePending = ({ mintTime, price, race }: Props) => {
  const { address, isConnected } = useAccount();
  const prize = `${formatUnits(race?.prize, 18).slice(0, 7)}Ξ`;
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

  return (
    <div>
      <div className="grid grid-cols-4 w-full p-6 bg-black rounded-lg text-white h-[210px]">
        <div className="col-span-3 flex flex-col justify-between h-full">
          <div>
            <div className="text-4xl mb-2">BaseRace #{currentRace.id}</div>
            <div className="text-sm">
              A new race starts daily! Survive 6 laps and fight for the prize
              pool
            </div>
          </div>
          {isMinting ? (
            <MintButton mintPrice={price} race={currentRace} />
          ) : (
            <div className="text-sm text-gray-300">
              The next BaseRace opens for registration at {nextMint}
            </div>
          )}
        </div>

        <div className="bg-blue-600 rounded-lg p-3">
          <div className="flex flex-col justify-between h-full">
            <div>
              <div>Prize {prize}</div>
              <div>Entries {currentRace.entries}</div>
              <div className="flex flex-row gap-2">
                <div>Starts in</div>
                <CountDown hour={20} />
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
