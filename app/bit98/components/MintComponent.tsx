"use client";

import type { Mint, RawMetadata } from "@/app/lib/types/types";
import { DateTime } from "luxon";
import BigNumber from "bignumber.js";
import Image from "next/image";
import { ArrowNav } from "@/app/lib/components/ArrowNav";
import { ElapsedTimer } from "@/app/lib/components/ElapsedTimer";
import { AddressToEns } from "@/app/lib/components/AddressToEns";
import { MintButton } from "@/app/bit98/components/MintButton";
import Link from "next/link";
import { SettleButton } from "@/app/bit98/components/SettleButton";
import { MintEntries } from "@/app/bit98/components/MintEntries";
import { useReadContract } from "wagmi";
import { humanizeNumber } from "@/app/lib/utils/numberUtils";
import { formatUnits } from "ethers";
import { Bit98ABI } from "@/app/lib/abi/Bit98.abi";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  meta: RawMetadata;
  mint: Mint;
  revalidate: () => void;
}

const MINT_DURATION = 4;

export const MintComponent = ({ meta, mint, revalidate }: Props) => {
  const queryClient = useQueryClient();
  const startTime = DateTime.fromMillis(
    BigNumber(mint.startedAt).toNumber() * 1000,
  );
  const settleTime = DateTime.fromMillis(
    BigNumber(mint.settledAt).toNumber() * 1000,
  );
  const endTime = startTime.plus({ hours: MINT_DURATION });

  const hasEnded =
    DateTime.now() >= endTime || BigNumber(mint.settledAt).toNumber() !== 0;
  const hasWinner =
    mint.winner !== "0x0000000000000000000000000000000000000000";

  const isOneOfOne = Boolean(BigNumber(mint.tokenId).toNumber() === 0);

  const {
    data: liveArtistEarnings,
    isSuccess: hasLiveArtistEarnings,
    queryKey,
  } = useReadContract({
    abi: Bit98ABI,
    address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
    functionName: "currentMintArtistReward",
    query: {
      enabled: !hasWinner,
    },
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey });
    revalidate();
  };

  const artistEarnings: string = hasWinner
    ? mint.rewards
    : hasLiveArtistEarnings
      ? `${humanizeNumber(Number(formatUnits(liveArtistEarnings as any)))}Ξ`
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

    return (
      <div>
        The Bit98 collection is minted out! Shop on secondaries on{" "}
        <Link
          className="hover:no-underline underline text-[#0000FF]"
          href={`https://opensea.io/assets/base/${process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS}`}
          target="_blank"
        >
          OpenSea
        </Link>
        .
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-start mt-2 sm:mt-4 sm:flex-row gap-8 md:gap-16 mb-8">
      <Image
        className="rounded-lg w-full md:w-[361px] md:h-[361px]"
        src={meta.image}
        alt={meta.name}
        width={361}
        height={361}
      />
      <div className="w-full">
        <div className="flex flex-row gap-2 text-[#677467] mb-4 items-center">
          <ArrowNav
            id={Number(meta.id)}
            path={"bit98"}
            hasNext={Number(meta.id) <= 511}
          />
          <div>
            {!isOneOfOne ? (
              <>
                {startTime.monthShort} {startTime.day}, {startTime.year}
              </>
            ) : (
              <>
                {settleTime.monthShort} {settleTime.day}, {settleTime.year}
              </>
            )}
          </div>
        </div>
        <div className="text-[#363E36] text-4xl font-semibold mb-4">
          {meta.name}
        </div>
        {isOneOfOne ? (
          <>
            <div className="flex flex-row sm:flex-nowrap flex-wrap py-2 sm:gap-10 gap-5 mb-5">
              <div className="flex flex-col">
                <div className="text-md text-[#677467]">Editions</div>
                <div className="text-3xl font-semibold text-[#363E36]">1</div>
              </div>
              <div className="flex flex-col">
                <div className="text-md text-[#677467]">Artist earnings</div>
                <div className="text-3xl font-semibold text-[#363E36]">0Ξ</div>
              </div>
            </div>
            <div className="flex flex-col gap-6 text-[#677467] mb-5">
              <div>
                This single-edition NFT was airdropped to{" "}
                <Link
                  className="hover:no-underline underline text-[#0000FF]"
                  href={`/users/${mint.winner}`}
                >
                  <AddressToEns address={mint.winner} />
                </Link>
                , who won the previous raffle.
              </div>
              <div className="hidden md:inline">
                View on{" "}
                <Link
                  className="hover:no-underline underline text-[#0000FF]"
                  href={`https://opensea.io/assets/base/${process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS}/${meta.id}`}
                  target="_blank"
                >
                  OpenSea
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-row sm:flex-nowrap flex-wrap py-2 sm:gap-10 gap-5 mb-5">
              <div className="flex flex-col">
                <div className="text-md text-[#677467]">Editions</div>
                <div className="text-3xl font-semibold text-[#363E36]">
                  {mint.mints.toString()}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-md text-[#677467]">Artist earnings</div>
                <div className="text-3xl font-semibold text-[#363E36]">
                  {artistEarnings}
                </div>
              </div>
              <ElapsedTimer
                startTime={mint.startedAt}
                duration={MINT_DURATION}
                startTitle={"Mint ends in"}
                endTitle={"Mint ended on"}
              />
            </div>
            {mintButton()}
          </>
        )}
      </div>
    </div>
  );
};
