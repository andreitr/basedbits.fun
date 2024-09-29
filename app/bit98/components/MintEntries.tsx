"use client";

import { Mint } from "@/app/lib/types/types";
import { useAccount, useReadContract } from "wagmi";
import { Bit98ABI } from "@/app/lib/abi/Bit98.abi";
import Link from "next/link";

interface Props {
  mint: Mint;
}

export const MintEntries = ({ mint }: Props) => {
  const { isConnected, address } = useAccount();

  const hasWinner =
    mint.winner !== "0x0000000000000000000000000000000000000000";

  const { data: totalEntries, isFetched: hasTotalEntries } = useReadContract({
    abi: Bit98ABI,
    address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
    functionName: "totalEntries",
    args: [BigInt(Number(mint.tokenId))],
  });

  const { data: userEntries, isFetched: hasUserEntries } = useReadContract({
    abi: Bit98ABI,
    address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
    functionName: "userEntryByAddress",
    args: [[BigInt(Number(mint.tokenId))], address],
    query: {
      enabled: isConnected,
    },
  });

  if (hasWinner) {
    return (
      <>
        The mint has ended, view on{" "}
        <Link
          className="hover:no-underline underline text-[#0000FF]"
          href={`https://opensea.io/assets/base/${process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS}/${mint.tokenId}`}
          target="_blank"
        >
          OpenSea
        </Link>
      </>
    );
  }

  if (!isConnected && hasTotalEntries) {
    return (
      <>
        There are <span className="font-semibold">{String(totalEntries)}</span>{" "}
        raffle entries.
      </>
    );
  }

  if (hasUserEntries && hasTotalEntries) {
    return (
      <>
        You hold <span className="font-semibold">{String(userEntries)}</span>{" "}
        out of <span className="font-semibold">{String(totalEntries)}</span>{" "}
        total raffle entries.
      </>
    );
  }

  return <>Loading raffle entries for this mint...</>;
};
