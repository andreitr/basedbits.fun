"use client";
import { SocialRewardsRound } from "@/app/lib/types/types";
import { DateTime } from "luxon";
import { SocialRoundTimer } from "@/app/earn/components/SocialRoundTimer";
import { SocialRoundEntry } from "@/app/earn/components/SocialRoundEntry";
import { NewEntry } from "@/app/earn/components/NewEntry";
import { useState } from "react";

interface Props {
  id: number;
  round: SocialRewardsRound;
}

const DURATION = 604800;
const SECONDS_IN_DAY = 86400;

export const SocialRound = ({ id, round }: Props) => {
  const startTime = DateTime.fromMillis(round.startedAt * 1000);
  const endTime = startTime.plus({ seconds: DURATION });

  const [entries, setEntries] = useState(new Array(round.entriesCount).fill(0));

  return (
    <div className="flex flex-col justify-start mt-2 sm:mt-4 sm:flex-row gap-8 md:gap-16 mb-8 w-full">
      <div className="w-full">
        <div className="text-[#363E36] text-4xl font-semibold">
          {"Social Rewards Round #"} {id}
        </div>
        <div className="text-[#363E36]">
          Post about Based Bits and earn tokens — 1024 BBITS awarded each week!
        </div>

        <div className="mb-10">
          <NewEntry
            onNewEntry={() => {
              setEntries((prevState) => {
                return [...prevState, 0];
              });
            }}
          />
        </div>

        <div className="w-full flex flex-col gap-4">
          {entries.map((_, index) => {
            return (
              <SocialRoundEntry
                key={index}
                entryId={entries.length - 1 - index}
                roundId={id}
                reward={1024}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col bg-black bg-opacity-10 rounded-lg p-5 gap-4">
        <div>
          <SocialRoundTimer
            start={startTime}
            end={endTime}
            startTitle={"Round ends in"}
            endTitle={"Round ended on"}
          />
        </div>
        <div>
          <div className="text-gray-500 text-xs uppercase">
            distributed rewards
          </div>
          <div className="text-2xl font-semibold text-[#363E36]">
            1024 BBITS
          </div>
        </div>

        <div>
          <div className="text-gray-500 text-xs uppercase">
            {"total entries"}
          </div>
          <div className="text-2xl font-semibold text-[#363E36]">
            {entries.length}
          </div>
        </div>
      </div>
    </div>
  );
};
