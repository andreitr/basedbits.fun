"use client";

import Image from "next/image";
import { MyStreak } from "@/app/lib/components/MyStreak";
import { useAccount } from "wagmi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import Link from "next/link";

export const CheckInComponent = () => {
  const { isConnected, address } = useAccount();

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
          Hold Based Bits? Check in!
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
          ,{" "}
          <Link
            href="/raid"
                      className="hover:underline font-semibold"
          >
            Pot Raiders
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

        <div className="mt-6 md:mt-10 md:h-[200px]">
          {isConnected && address ? (
            <MyStreak address={address} />
          ) : (
            <ConnectAction action={"to check-in"} />
          )}
        </div>
      </div>
    </div>
  );
};
