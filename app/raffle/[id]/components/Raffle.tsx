"use client";

import { useReadContract } from "wagmi";
import { BBitsRaffleABI } from "@/app/lib/abi/BBitsRaffle.abi";
import BigNumber from "bignumber.js";
import { RaffleTimer } from "@/app/raffle/[id]/components/RaffleTimer";
import Image from "next/image";
import { DateTime, Duration, Interval } from "luxon";
import { RaffleEntries } from "@/app/raffle/[id]/components/RaffleEntries";
import { EntryButton } from "@/app/raffle/[id]/components/EntryButton";
import { RaffleWinner } from "@/app/raffle/[id]/components/RaffleWinner";
import { SettleButton } from "@/app/raffle/[id]/components/SettleButton";
import { useQueryClient } from "@tanstack/react-query";

interface RaffleProps {
  id?: number;
}

type RaffleSponsor = {
  sponsor: `0x${string}`;
  tokenId: BigNumber;
};

export const Raffle = ({ id }: RaffleProps) => {
  const queryClient = useQueryClient();

  const { data: latestRaffleId, isFetched: isFetchedRaffleId } =
    useReadContract({
      abi: BBitsRaffleABI,
      address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
      functionName: "getCurrentRaffleId",
      query: {
        enabled: !id,
      },
    });

  const raffleId = id || latestRaffleId;

  const { data, queryKey, isFetched } = useReadContract({
    abi: BBitsRaffleABI,
    address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
    functionName: "idToRaffle",
    args: [Number(raffleId)],
    query: {
      enabled: !!raffleId,
    },
  });

  if (isFetched && data && raffleId) {
    let [startedAt, settledAt, winner, sponsor] = data as [
      BigNumber,
      BigNumber,
      `0x${string}`,
      RaffleSponsor,
    ];

    const startTime = DateTime.fromMillis(
      BigNumber(startedAt).toNumber() * 1000,
    );

    const elapsedTime = Interval.fromDateTimes(startTime, DateTime.now());
    const remainingTime = Duration.fromObject({ hours: 24 }).minus(
      elapsedTime.toDuration("hours"),
    );

    const isEnded = remainingTime.as("milliseconds") <= 0;
    const hasWinner = winner !== `0x${"0".repeat(40)}`;

    const reloadRaffle = () => {
      queryClient.invalidateQueries({ queryKey });
    };

    return (
      <div className="flex flex-col justify-between mt-2 sm:mt-4 sm:flex-row gap-8">
        <div className="flex p-6 bg-[#ABBEAC] rounded-lg sm:mb-7">
          <Image
            className="rounded-lg m-auto"
            width={350}
            height={350}
            alt={`Based Bit ${sponsor.tokenId}`}
            src={`https://ipfs.raribleuserdata.com/ipfs/QmRqqnZsbMLJGWt8SWjP2ebtzeHtWv5kkz3brbLzY1ShHt/${sponsor.tokenId}.png`}
          />
        </div>
        <div>
          <div className="flex flex-row gap-2 text-[#677467] mb-4 items-center">
            <div>
              {startTime.monthLong} {startTime.day},{startTime.year}
            </div>
          </div>
          <div className="text-[#363E36] text-4xl font-semibold mb-4">
            Raffle #{Number(raffleId)}
          </div>

          <div className="flex flex-row py-2 w-full justify-start gap-16">
            <RaffleEntries id={Number(raffleId)} />
            <RaffleTimer startTime={startedAt} endTime={settledAt} />
          </div>

          {isEnded ? (
            <>
              {hasWinner ? (
                <div className="mt-8">
                  <RaffleWinner address={winner} />
                </div>
              ) : (
                <div className="mt-8">
                  <SettleButton onSuccess={reloadRaffle} />
                </div>
              )}
            </>
          ) : (
            <div className="mt-8">
              <EntryButton id={Number(id)} onSuccess={reloadRaffle} />
            </div>
          )}

          <div className="mt-10 text-[#677467]">
            <div className="mb-3">
              Want to win{" "}
              <span className="mt-2 font-semibold">{`Based Bit #${sponsor.tokenId}`}</span>
              ?
            </div>
            <div className="text-sm">
              <span className="mt-2 font-semibold">Free Entry</span>: A Based
              Bit NFT + Recent Check-in
            </div>
            <div className="text-sm">
              <span className="font-semibold">Paid Entry</span>: A tiny fee of
              0.0001Ξ to discourage bots
            </div>
          </div>
        </div>
      </div>
    );
  }
};
