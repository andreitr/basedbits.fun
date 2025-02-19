"use client";

import { BaseRace } from "@/app/lib/types/types";
import { useLap } from "@/app/lib/hooks/baserace/useLap";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { MintButton } from "@/app/baserace/components/MintButton";
import { CountDown } from "@/app/lib/components/client/CountDown";
import { DateTime } from "luxon";
import { formatUnits } from "ethers";
import { useAccount } from "wagmi";
import { useEntriesForAddress } from "@/app/lib/hooks/baserace/useEntriesForAddress";

interface Props {
  race: BaseRace;
}

export const RaceLive = ({ race }: Props) => {
  const prize = `${formatUnits(race?.prize, 18).slice(0, 7)}Ξ`;
  const { address, isConnected } = useAccount();
  const { data: userEntries } = useEntriesForAddress({
    address,
    id: race.id,
    enabled: isConnected,
  });

  const { data: lap, isLoading } = useLap({
    raceId: race.id,
    lapId: race.currentLap,
    enabled: true,
  });

  const nextMint = DateTime.utc()
    .set({ hour: 20, minute: 0 })
    .toFormat("h:mm a");

  if (isLoading || !lap) return <div>Loading...</div>;

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

          <div className="text-sm text-gray-300">
            The next BaseRace opens for registration at {nextMint}
          </div>
        </div>

        <div className="bg-blue-600 rounded-lg p-3">
          <div className="flex flex-col justify-between h-full">
            <div>
              <div>Prize {prize}</div>
              <div>Entries {race.entries}</div>
              <div>Lap {race.currentLap} of 6</div>
            </div>

            {address && userEntries && (
              <div>Your entries: {userEntries.length}</div>
            )}
          </div>
        </div>
      </div>

      <div>Lap {race.currentLap}</div>
      <div>Lap {lap.positions}</div>
      <div>
        Lap Ends{" "}
        <CountDownToDate
          targetDate={lap.startedAt + 600}
          message={"Lap ended"}
        />
      </div>
    </div>
  );
};
