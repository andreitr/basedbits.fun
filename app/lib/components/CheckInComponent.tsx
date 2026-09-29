"use client";

import Image from "next/image";
import { MyStreak, MyStreakSkeleton } from "@/app/lib/components/MyStreak";
import { Button } from "@/app/lib/components/Button";
import { useModal } from "connectkit";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { useWallet } from "@/app/lib/Web3Provider";
import Link from "next/link";

export const CheckInComponent = () => {
  const { isReady, isConnected, address } = useWallet();
  const { setOpen } = useModal();

  return (
    <div className="flex flex-col justify-between sm:mt-8 gap-6 sm:gap-20 sm:flex-row">
      {/* developer.png is 500x925; explicit dimensions let the browser reserve its box before it loads */}
      <Image
        className="w-[140px] sm:w-[250px] h-auto mx-auto sm:m-0 shrink-0"
        src="/images/developer.png"
        alt="Are you here?"
        width={250}
        height={463}
        sizes="(min-width: 640px) 250px, 140px"
        priority={true}
      />

      <div className="flex flex-col justify-center sm:ml-4">
        <div className="text-3xl sm:text-4xl font-semibold text-[#363E36] mb-2">
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
          <Link href="/raid" className="hover:underline font-semibold">
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

        {/* Same reserved height whether the wallet is restoring, connected or not, so nothing below jumps */}
        <div className="mt-6 md:mt-10 min-h-[200px] md:h-[200px]">
          {!isReady ? (
            <MyStreakSkeleton />
          ) : isConnected && address ? (
            <MyStreak address={address} />
          ) : (
            <div className="flex flex-col gap-4">
              <ConnectAction action={"to check-in"} />
              <Button
                className="sm:w-auto sm:self-start"
                onClick={() => setOpen(true)}
              >
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
