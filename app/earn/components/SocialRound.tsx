"use client";
import { ArrowNav } from "@/app/lib/components/ArrowNav";
import { SocialRewardsRound } from "@/app/lib/types/types";
import { DateTime } from "luxon";
import Image from "next/image";
import { ElapsedTimerNew } from "@/app/lib/components/ElapsedTimerNew";
import { SocialRoundEntry } from "@/app/earn/components/SocialRoundEntry";

interface Props {
  id: number;
  round: SocialRewardsRound;
}

const DURATION = 604800;
const SECONDS_IN_DAY = 86400;

export const SocialRound = ({ id, round }: Props) => {
  const startTime = DateTime.fromMillis(round.startedAt * 1000);
  const endTime = startTime.plus({ seconds: DURATION });
  const entries = new Array(round.entriesCount).fill(0);

  return (
    <div className="flex flex-col justify-start mt-2 sm:mt-4 sm:flex-row gap-8 md:gap-16 mb-8 w-full">
      <div className="w-full">
        <div className="flex flex-row gap-2 text-[#677467] mb-4 items-center">
          <ArrowNav id={id} path={"earn"} hasNext={round.settledAt !== 0} />
          <div>
            {startTime.monthLong} {startTime.day},{startTime.year}
          </div>
        </div>
        <div className="text-[#363E36] text-4xl font-semibold mb-4">
          {"Social Rewards Round #"}
          {id}
        </div>

        <div className="flex flex-row sm:flex-nowrap flex-wrap py-2 sm:gap-10 gap-5 mb-5">
          <div className="flex flex-col">
            <div className="text-md text-[#677467]">Entries</div>
            <div className="text-3xl font-semibold text-[#363E36]">
              {round.entriesCount}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-md text-[#677467]">Reward pool</div>
            <div className="text-3xl font-semibold text-[#363E36]">
              {round.userReward === "0"
                ? "1024 BBITS"
                : `${round.userReward} BBITS`}
            </div>
          </div>
          <ElapsedTimerNew
            start={startTime}
            end={endTime}
            startTitle={"Round ends in"}
            endTitle={"Round ended on"}
          />
        </div>

        <div>
          {entries.map((_, index) => {
            return (
              <SocialRoundEntry key={index} entryId={index} roundId={id} />
            );
          })}
        </div>
      </div>
      <Image
        className="w-auto max-w-72 hidden sm:block scale-x-[-1]"
        src="/images/notepad.png"
        alt="Are you here?"
        width={250}
        height={250}
        priority={true}
      />
    </div>
  );
};
