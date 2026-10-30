"use client";

import { useOddsDrawings } from "@/app/lib/hooks/evilodds/useOddsDrawings";
import Image from "next/image";
import Link from "next/link";
import { formatUnits } from "viem";

interface Props {
  // Server-read jackpot (USDC base units) so the sentence below renders complete and doesn't reflow once data loads
  initialTopPrize?: string;
}

export const OddsMint = ({ initialTopPrize }: Props) => {
  const { data: drawings } = useOddsDrawings();
  const topPrize =
    drawings?.topPrize ??
    (initialTopPrize ? BigInt(initialTopPrize) : undefined);
  const jackpot =
    topPrize !== undefined
      ? `$${Math.round(Number(formatUnits(topPrize, 6))).toLocaleString("en-US")}`
      : undefined;

  return (
    <div className="relative w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 sm:rounded-lg rounded-none text-white p-5">
      {/* Only on wide screens; narrower cards have no room for it beside the title */}
      <Link
        href="https://megapot.io/r/U57WDQ"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden lg:block absolute top-5 right-5"
      >
        <Image
          src="/images/powered-by-megapot.svg"
          alt="Powered by Megapot"
          width={125}
          height={34}
          className="h-[39px] w-auto"
        />
      </Link>
      <div className="flex flex-col sm:flex-row w-full gap-5">
        <div className="shrink-0">
          <Image
            src="/images/evil_odds.svg"
            alt="Evil Odds"
            width={300}
            height={300}
            className="w-full sm:w-[300px] h-auto rounded-lg"
            priority
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row items-center gap-3">
            <div className="sm:text-5xl text-4xl text-[#FEC94F]">
              Evil Odds
            </div>
          </div>
          <div className="text-sm text-gray-400 pt-2">
            Evil Odds summon cursed numbers every drawing, chasing a{" "}
            {jackpot ? `${jackpot} ` : ""}
            <Link
              href="https://megapot.io/r/U57WDQ"
              className="underline hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              Megapot
            </Link>{" "}
            jackpot. Burn one to get your share of the treasury.
          </div>
          <div className="mt-auto pt-4">
            <div className="border border-[#FEC94F]/30 rounded-lg p-4 text-base sm:text-lg text-white">
              <Link
                href="https://megapot.io/blog/thank-you-for-playing"
                className="underline hover:text-[#FEC94F]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Megapot is shutting down
              </Link>
              , and Evil Odds can&apos;t work without it. Thank you for
              playing! Please{" "}
              <Link href="/odds" className="underline hover:text-[#FEC94F]">
                burn your NFTs
              </Link>{" "}
              to redeem their remaining value.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
