"use client";

import type { Mint, RawMetadata } from "@/app/lib/types/types";
import { DateTime } from "luxon";
import BigNumber from "bignumber.js";
import Image from "next/image";
import { ArrowNav } from "@/app/lib/components/ArrowNav";
import { ElapsedTimer } from "@/app/lib/components/ElapsedTimer";
import { formatUnits } from "ethers";
import { AddressToEns } from "@/app/lib/components/AddressToEns";
import { MintButton } from "@/app/emojibits/components/MintButton";
import Link from "next/link";
import { SettleButton } from "@/app/emojibits/components/SettleButton";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { MintEntries } from "@/app/emojibits/components/MintEntries";
import { useReadContract } from "wagmi";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";
import { humanizeNumber } from "@/app/lib/utils/numberUtils";

interface Props {
  meta: RawMetadata;
  mint: Mint;
  revalidate: () => void;
}

export const MintComponent = ({ meta, mint, revalidate }: Props) => {
  const startTime = DateTime.fromMillis(
    BigNumber(mint.startedAt).toNumber() * 1000,
  );
  const endTime = startTime.plus({ hours: 8 });

  const hasEnded =
    DateTime.now() >= endTime || BigNumber(mint.settledAt).toNumber() !== 0;
  const hasWinner =
    mint.winner !== "0x0000000000000000000000000000000000000000";

  const { data: liveRaffleRewards, isFetched: hasLiveRaffleAmount } =
    useReadContract({
      abi: EmojiBitsABI,
      address: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
      functionName: "currentMintRaffleAmount",
      query: {
        enabled: !hasEnded && !hasWinner,
      },
    });

  const raffleAmount: string = hasWinner
    ? mint.rewards
    : hasLiveRaffleAmount
      ? `${humanizeNumber(Number(formatUnits(liveRaffleRewards as any)))}Ξ`
      : "";

  const mintButton = () => {
    if (hasEnded && hasWinner) {
      return (
        <div className="p-4 bg-[#ABBEAC] rounded-lg text-center text-xl font-semibold text-[#363E36]">
          <Link href={`/users/${mint.winner}`}>
            Raffle won by <AddressToEns address={mint.winner} />
          </Link>
        </div>
      );
    }

    if (hasEnded && !hasWinner) {
      return <SettleButton revalidate={revalidate} />;
    }
    return <MintButton meta={meta} revalidate={revalidate} />;
  };

  return (
    <div className="flex flex-col justify-start mt-2 sm:mt-4 sm:flex-row gap-8 md:gap-16 mb-8">
      <Image
        className="rounded-lg w-full md:w-[357px] md:h-[357px] bg-[#0052FF]"
        src={meta.image}
        alt={meta.name}
        width={357}
        height={357}
      />
      <div className="w-full">
        <div className="flex flex-row gap-2 text-[#677467] mb-4 items-center">
          <ArrowNav
            id={Number(mint.tokenId)}
            path={"emojibits"}
            hasNext={hasEnded}
          />
          <div>
            {startTime.monthLong} {startTime.day},{startTime.year}
          </div>
        </div>
        <div className="text-[#363E36] text-4xl font-semibold mb-4">
          {meta.name}
        </div>

        <div className="flex flex-row sm:flex-nowrap flex-wrap py-2 sm:gap-10 gap-5 mb-5">
          <div className="flex flex-col">
            <div className="text-md text-[#677467]">Mints</div>
            <div className="text-3xl font-semibold text-[#363E36]">
              {mint.mints.toString()}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-md text-[#677467]">Raffle Reward</div>
            <div className="text-3xl font-semibold text-[#363E36]">
              {raffleAmount}
            </div>
          </div>
          <ElapsedTimer
            startTime={mint.startedAt}
            duration={8}
            startTitle={"Mint ends in"}
            endTitle={"Mint ended on"}
          />
        </div>
        <div className="text-[#677467] mb-5">{<MintEntries mint={mint} />}</div>
        {mintButton()}
      </div>
    </div>
  );
};
