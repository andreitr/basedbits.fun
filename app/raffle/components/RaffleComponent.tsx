"use client";

import BigNumber from "bignumber.js";
import Image from "next/image";
import { DateTime, Duration, Interval } from "luxon";
import { RaffleEntries } from "@/app/raffle/components/RaffleEntries";
import { EntryButton } from "@/app/raffle/components/EntryButton";
import { SettleButton } from "@/app/raffle/components/SettleButton";
import { type Raffle } from "@/app/lib/types/types";
import { RaffleRules } from "@/app/raffle/components/RaffleRules";
import { ArrowNav } from "@/app/lib/components/ArrowNav";
import { ElapsedTimer } from "@/app/lib/components/ElapsedTimer";
import Link from "next/link";
import { AddressToEns } from "@/app/lib/components/AddressToEns";

interface RaffleProps {
  id: number;
  raffle: Raffle;
  revalidate: () => void;
}

export const RaffleComponent = ({ id, raffle, revalidate }: RaffleProps) => {
  const startTime = DateTime.fromMillis(
    BigNumber(raffle.startedAt).toNumber() * 1000,
  );

  const elapsedTime = Interval.fromDateTimes(startTime, DateTime.now());
  const remainingTime = Duration.fromObject({ hours: 24 }).minus(
    elapsedTime.toDuration("hours"),
  );

  const isEnded = remainingTime.as("milliseconds") <= 0;
  const hasWinner = raffle.winner !== `0x${"0".repeat(40)}`;

  return (
    <div className="flex flex-col justify-between mt-2 sm:mt-4 sm:flex-row gap-8">
      <div className="flex p-6 bg-[#ABBEAC] rounded-lg sm:mb-7">
        <Image
          className="rounded-lg m-auto"
          width={350}
          height={350}
          alt={`Based Bit ${raffle.sponsor.tokenId}`}
          src={`https://ipfs.raribleuserdata.com/ipfs/QmRqqnZsbMLJGWt8SWjP2ebtzeHtWv5kkz3brbLzY1ShHt/${raffle.sponsor.tokenId}.png`}
        />
      </div>
      <div>
        <div className="flex flex-row gap-2 text-[#677467] mb-4 items-center">
          <ArrowNav id={id} path={"raffle"} hasNext={isEnded} />
          <div>
            {startTime.monthLong} {startTime.day},{startTime.year}
          </div>
        </div>
        <div className="text-[#363E36] text-4xl font-semibold mb-4">
          Raffle #{Number(id)}
        </div>

        <div className="flex flex-row py-2 w-full justify-start gap-16">
          <RaffleEntries id={Number(id)} />
          <ElapsedTimer
            startTime={raffle.startedAt}
            duration={24}
            startTitle={"Raffle ends in"}
            endTitle={"Raffle ended"}
          />
        </div>

        {isEnded ? (
          <>
            {hasWinner ? (
              <div className="mt-8">
                <div className="p-4 bg-[#ABBEAC] rounded-lg text-center">
                  <div className="text-xl font-semibold text-[#363E36]">
                    <Link href={`/users/${raffle.winner}`}>
                      winner → {<AddressToEns address={raffle.winner} />}
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <SettleButton onSuccess={() => revalidate()} />
              </div>
            )}
          </>
        ) : (
          <div className="mt-8">
            <EntryButton id={Number(id)} onSuccess={() => revalidate()} />
          </div>
        )}

        <RaffleRules raffle={raffle} />
      </div>
    </div>
  );
};
