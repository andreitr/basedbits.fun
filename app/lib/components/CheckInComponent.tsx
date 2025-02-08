"use client";

import Image from "next/image";
import { MyStreak } from "@/app/lib/components/MyStreak";
import { useAccount } from "wagmi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import Link from "next/link";
import { useCheckinEligibility } from "@/app/lib/hooks/useCheckinEligibility";

interface Props {
  checkins: string[];
}

export const CheckInComponent = ({ checkins }: Props) => {
  const { address, isConnected } = useAccount();
  const { data: isEligible } = useCheckinEligibility({
    address,
    enabled: isConnected,
  });

  return (
    <div className="flex flex-col justify-between mt-8 gap-20 sm:flex-row">
      <Image
        className="w-auto max-w-72 m-auto sm:m-0"
        src="/images/developer.png"
        alt="Are you here?"
        width={250}
        height={250}
        priority={true}
      />

      <div className="flex flex-col justify-center mt-8 sm:mt-0 sm:ml-4">
        <div className="text-4xl font-semibold text-[#363E36] mb-2">
          Hold Based Bits? Check-in!
        </div>
        <div className="text-[#677467]">
          Check in to receive the daily BBITS airdrop and other goodies! You
          must hold a{" "}
          <Link
            href="https://opensea.io/collection/based-bits"
            target="_blank"
            className="hover:underline font-semibold"
          >
            Based Bits
          </Link>
          ,{" "}
          <Link href="/burn" className="hover:underline font-semibold">
            Burned Bits
          </Link>
          , or{" "}
          <Link
            href="https://opensea.io/collection/punkalot"
            target="_blank"
            className="hover:underline font-semibold"
          >
            Punkalot
          </Link>{" "}
          NFT.
        </div>

        <div className="mt-6 md:mt-10">
          {!isConnected && <ConnectAction action={"to check-in"} />}
          {isConnected && isEligible === true && <MyStreak />}
          {isConnected && isEligible === false && (
            <div className="flex flex-col text-[#677467]">
              <div>
                You do not hold any eligible NFTs to check in.{" "}
                <Link
                  className="underline text-[#0000FF]"
                  href="/burn"
                  target="_blank"
                >
                  Mint one now
                </Link>
                .
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
