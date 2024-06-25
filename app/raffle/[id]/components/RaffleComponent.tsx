"use client";

import {useReadContract} from "wagmi";
import {BBitsRaffleABI} from "@/app/lib/abi/BBitsRaffle.abi";
import BigNumber from "bignumber.js";
import {RaffleTimer} from "@/app/raffle/[id]/components/RaffleTimer";
import Image from "next/image";
import {DateTime, Duration, Interval} from "luxon";
import {RaffleEntries} from "@/app/raffle/[id]/components/RaffleEntries";
import {EntryButton} from "@/app/raffle/[id]/components/EntryButton";
import {RaffleWinner} from "@/app/raffle/[id]/components/RaffleWinner";
import {SettleButton} from "@/app/raffle/[id]/components/SettleButton";
import {type Raffle} from "@/app/lib/types/types";
import {RaffleNav} from "@/app/raffle/[id]/components/RaffleNav";
import Link from "next/link";

interface RaffleProps {
    id: number;
    raffle: Raffle;
}

export const RaffleComponent = ({id, raffle}: RaffleProps) => {

    const startTime = DateTime.fromMillis(
        BigNumber(raffle.startedAt).toNumber() * 1000,
    );

    const elapsedTime = Interval.fromDateTimes(startTime, DateTime.now());
    const remainingTime = Duration.fromObject({hours: 24}).minus(
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
                    <RaffleNav id={id} hasNext={isEnded}/>
                    <div>
                        {startTime.monthLong} {startTime.day},{startTime.year}
                    </div>
                </div>
                <div className="text-[#363E36] text-4xl font-semibold mb-4">
                    Raffle #{Number(id)}
                </div>

                <div className="flex flex-row py-2 w-full justify-start gap-16">
                    <RaffleEntries id={Number(id)}/>
                    <RaffleTimer startTime={raffle.startedAt} endTime={raffle.settledAt}/>
                </div>

                {isEnded ? (
                    <>
                        {hasWinner ? (
                            <div className="mt-8">
                                <RaffleWinner address={raffle.winner}/>
                            </div>
                        ) : (
                            <div className="mt-8">
                                <SettleButton onSuccess={() => {
                                }}/>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mt-8">
                        <EntryButton id={Number(id)} onSuccess={() => {
                        }}/>
                    </div>
                )}

                <div className="mt-10 text-[#677467]">
                    <div className="mb-3">
                        Here's how to win{" "}
                        <Link
                            className="mt-2 font-semibold hover:underline"
                            target="_blank"
                            href={`https://opensea.io/assets/base/0x617978b8af11570c2dab7c39163a8bde1d282407/${raffle.sponsor.tokenId}`}>{`Based Bit #${raffle.sponsor.tokenId}`}</Link>

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

};
