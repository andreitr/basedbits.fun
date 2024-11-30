"use client";

import Image from "next/image";
import { MyStreak } from "@/app/lib/components/MyStreak";
import { useAccount } from "wagmi";
import { useGetUserNFTs } from "@/app/lib/hooks/useGetUserNFTs";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import Link from "next/link";

export const CheckInComponent = () => {
  const { address, isConnected } = useAccount();
  const { data: userNFTs } = useGetUserNFTs({
    contract: process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS!,
    address,
    size: 1,
  });
  const holder = Boolean(userNFTs && userNFTs.totalCount > 0);

  return (
    <div className="flex flex-col justify-between mt-8 sm:flex-row">
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
          Daily check-ins unlock mint discounts, free raffle entries, and more.
        </div>

        <div className="mt-6 md:mt-10">
          {holder ? (
            <>
              {isConnected ? (
                <MyStreak address={address!} holder={holder} />
              ) : (
                <ConnectAction action={"to check-in"} />
              )}
            </>
          ) : (
            <div className="flex flex-col text-[#677467]">
              <div>You need a Based Bit NFT to check in :(</div>
              <div>
                Grab one on{" "}
                <Link
                  className="underline text-[#0000FF]"
                  href="https://opensea.io/collection/based-bits"
                  target="_blank"
                >
                  OpenSea
                </Link>{" "}
                or try your luck in the raffle!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
