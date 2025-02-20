"use client";

import { MintButton } from "@/app/baserace/components/MintButton";
import { formatUnits } from "ethers";
import { useAccount } from "wagmi";
import { useEntriesForAddress } from "@/app/lib/hooks/baserace/useEntriesForAddress";
import { CountDown } from "@/app/lib/components/client/CountDown";
import { BaseRace, BaseRaceEntry } from "@/app/lib/types/types";
import { DateTime } from "luxon";
import { Racers } from "@/app/baserace/components/Racers";
import { useState } from "react";

interface Props {
  mintTime: number;
  price: string;
  race: BaseRace;
}

export const RacePending = ({ mintTime, price, race }: Props) => {
  const { address, isConnected } = useAccount();

  const prize = `${formatUnits(race?.prize, 18).slice(0, 7)}Ξ`;
  const isMinting = race.startedAt + mintTime > DateTime.now().toSeconds();

  const { data: userEntries } = useEntriesForAddress({
    address,
    id: race.id,
    enabled: isConnected,
  });

  const nextMint = DateTime.utc()
    .set({ hour: 20, minute: 0 })
    .toFormat("h:mm a");

  const [racers, setRacers] = useState<BaseRaceEntry[]>(
    Array.from({ length: 35 }, (_, index) => ({
      tokenId: index,
      index,
    })),
  );

  const myEntries = [2, 4, 5, 6, 11, 18];
  const newArray = racers.filter((racer) => myEntries.includes(racer.tokenId));

  const handleClick = (tokenId: number) => {
    setRacers((prevRacers) => {
      const newRacers = [...prevRacers];
      const index = newRacers.findIndex((racer) => racer.tokenId === tokenId);
      if (index > -1) {
        const [clickedItem] = newRacers.splice(index, 1);
        newRacers.unshift(clickedItem);
        newRacers.forEach((racer, idx) => {
          racer.index = idx;
        });
      }
      return newRacers;
    });
  };

  const eliminated = 4;

  return (
    <div>
      <div className="grid grid-cols-4 w-full p-6 bg-black rounded-lg text-white h-[210px]">
        <div className="col-span-3 flex flex-col justify-between h-full">
          <div>
            <div className="text-4xl mb-2">BaseRace #{race.id}</div>
            <div className="text-sm">
              A new race starts daily! Survive 6 laps and fight for the prize
              pool
            </div>
          </div>
          {isMinting ? (
            <MintButton mintPrice={price} />
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
              <div>Entries {race.entries}</div>
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

      <div>
        <div className="grid grid-cols-4 my-8 gap-8 ">
          <div className="col-span-3 flex flex-col gap-4">
            <div className="text-xs uppercase">All Racers</div>
            <Racers
              onClick={handleClick}
              entries={racers}
              eliminated={eliminated}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-xs uppercase">My Racers</div>
            <Racers
              onClick={handleClick}
              entries={newArray}
              eliminated={eliminated}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
