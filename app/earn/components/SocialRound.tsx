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
  reward: number;
  duration: number;
}

export const SocialRound = ({ id, round, reward, duration }: Props) => {
  const startTime = DateTime.fromMillis(round.startedAt * 1000);
  const endTime = startTime.plus({ seconds: duration });

  const [entries, setEntries] = useState(new Array(round.entriesCount).fill(0));
  const entriesLabel =
    round.entriesCount > 0
      ? `${round.entriesCount} ${round.entriesCount === 1 ? "entry" : "entries"}`
      : "No entries yet. Be the first one to post!";

  return (
    <div className="flex flex-col justify-start mt-2 sm:mt-4 sm:flex-row gap-8 md:gap-16 mb-8 w-full">
      <div className="w-full">
        <div className="flex sm:flex-row flex-col justify-between">
          <div>
            <div className="text-[#363E36] text-4xl font-semibold">
              {"Social Rewards"}
            </div>
            <div className="text-[#677467]">
              Post about Based Bits on socials and earn!
            </div>
          </div>
          <div className="flex flex-row gap-6 bg-black bg-opacity-10 py-2 px-4 rounded-md justify-center items-center">
            <div>
              <div className="text-gray-500 text-xs uppercase">reward pool</div>
              <div className="text-2xl font-semibold text-[#363E36]">
                {reward} BBITS
              </div>
            </div>
            <SocialRoundTimer endTime={endTime} />
          </div>
        </div>

        <div className="mt-10 mb-10">
          <div className="bg-white p-10 rounded-lg">
            Social rewards are paused until further notice. Rumor has it that{" "}
            <a
              href="https://warpcast.com/andreitr.eth/0x2dfd961b"
              target="_blank"
              className="hover:no-underline underline text-[#0000FF]"
            >
              @andreitr
            </a>{" "}
            plans to replace them with direct check-in airdrops.
          </div>
        </div>

        <div className="mb-2">{entriesLabel}</div>
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
    </div>
  );
};
