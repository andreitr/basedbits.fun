"use client";

import type { Mint } from "@/app/lib/types/types";
import { DateTime, Duration, Interval } from "luxon";
import BigNumber from "bignumber.js";
import Image from "next/image";
import { ArrowNav } from "@/app/lib/components/ArrowNav";
import { ElapsedTimer } from "@/app/lib/components/ElapsedTimer";
import { humanizeNumber } from "@/app/lib/utils/numberUtils";
import { formatUnits } from "ethers";
import { AddressToEns } from "@/app/lib/components/AddressToEns";
import { MintButton } from "@/app/emojibits/components/MintButton";
import Link from "next/link";
import { SettleButton } from "@/app/emojibits/components/SettleButton";
import { AlchemyToken } from "@/app/lib/types/alchemy";

interface Props {
  token: AlchemyToken;
  mint: Mint;
}

export const MintComponent = ({ mint, token }: Props) => {
  const startTime = DateTime.fromMillis(
    BigNumber(mint.startedAt).toNumber() * 1000,
  );

  const elapsedTime = Interval.fromDateTimes(startTime, DateTime.now());
  const remainingTime = Duration.fromObject({ hours: 8 }).minus(
    elapsedTime.toDuration("hours"),
  );

  const isEnded = remainingTime.as("milliseconds") <= 0;
  const hasWinner = mint.winner !== `0x${"0".repeat(40)}`;

  const mintButton = () => {
    if (isEnded && hasWinner) {
      return (
        <div className="p-4 bg-[#ABBEAC] rounded-lg text-center text-xl font-semibold text-[#363E36]">
          <Link href={`/users/${mint.winner}`}>
            Raffle won by <AddressToEns address={mint.winner} />
          </Link>
        </div>
      );
    }

    if (isEnded && !hasWinner) {
      return (
        <div className="mt-8">
          <SettleButton />
        </div>
      );
    }

    return <MintButton token={token} />;
  };

  return (
    <div className="flex flex-col justify-start mt-2 sm:mt-4 sm:flex-row gap-16 mb-8">
      <Image
        className="rounded-lg w-full md:w-[350px]"
        src={token.image.originalUrl}
        alt={`Emoji Bit ${token.tokenId}`}
        width={350}
        height={350}
      />
      <div>
        <div className="flex flex-row gap-2 text-[#677467] mb-4 items-center">
          <ArrowNav
            id={Number(mint.tokenId)}
            path={"emojibits"}
            hasNext={isEnded}
          />
          <div>
            {startTime.monthLong} {startTime.day},{startTime.year}
          </div>
        </div>
        <div className="text-[#363E36] text-4xl font-semibold mb-4">
          Emoji Bit #{mint.tokenId.toString()}
        </div>

        <div className="flex flex-row py-2 w-full gap-10">
          <div className="flex flex-col">
            <div className="text-md text-[#677467]">Mints</div>
            <div className="text-3xl font-semibold text-[#363E36]">
              {mint.mints.toString()}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-md text-[#677467]">Raffle Reward</div>
            <div className="text-3xl font-semibold text-[#363E36]">
              {humanizeNumber(Number(formatUnits(mint.rewards)))}Ξ
            </div>
          </div>
          <ElapsedTimer
            startTime={mint.startedAt}
            duration={8}
            startTitle={"Mint ends in"}
            endTitle={"Mint ended on"}
          />
        </div>
        <div className="my-10">{mintButton()}</div>
        <div className="text-[#677467]">{/*<MintEntries mint={mint} />*/}</div>
      </div>
    </div>
  );
};
