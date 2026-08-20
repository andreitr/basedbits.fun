"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const MintComponent = () => {
  const pathname = usePathname();

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 sm:rounded-lg rounded-none text-white p-5">
      <div className="flex flex-col sm:flex-row w-full gap-5">
        <div>
          <Image
            src="/images/raider_black.svg"
            alt="Pot Raider"
            width={100}
            height={100}
            className="w-full sm:w-[400px] rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-7 justify-between w-full">
          <div>
            <div className="flex flex-col gap-2 justify-center pb-6">
              <div className="sm:text-5xl text-4xl text-[#FEC94F]">
                Pot Raiders
              </div>
              <div className="text-sm text-gray-400">
                The Pot Raiders raid has ended. For a full year, Pot Raiders
                spent a share of the treasury on Megapot tickets. Thanks to
                everyone who joined the raid!
              </div>
            </div>
          </div>
          <div className="flex text-sm w-full justify-between ">
            <div className="flex flex-row gap-3">
              {pathname !== "/raid" && (
                <Link
                  href={`/raid`}
                  className="underline text-gray-400 hover:text-white"
                >
                  Your Holdings
                </Link>
              )}
              <Link
                href="/raid/history"
                className="underline text-gray-400 hover:text-white"
              >
                Stats
              </Link>
            </div>
            <div className="flex flex-row gap-3 text-gray-500">
              <Link
                href={`https://opensea.io/item/base/${process.env.NEXT_PUBLIC_RAIDER_ADDRESS}`}
                className="underline hover:text-white"
                target="_blank"
              >
                OpenSea
              </Link>
              <Link
                href={`https://basescan.org/address/${process.env.NEXT_PUBLIC_RAIDER_ADDRESS}`}
                className="underline hover:text-white"
                target="_blank"
              >
                Basescan
              </Link>
              <Link
                href={`https://v1.megapot.io`}
                className="underline hover:text-white"
                target="_blank"
              >
                Megapot
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
