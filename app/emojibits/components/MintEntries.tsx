"use client";

import { Mint } from "@/app/lib/types/types";
import { useAccount, useReadContract } from "wagmi";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";

interface Props {
  mint: Mint;
}

export const MintEntries = ({ mint }: Props) => {
  const { isConnected, address } = useAccount();

  const { data: totalEntries, isFetched: hasTotalEntries } = useReadContract({
    abi: EmojiBitsABI,
    address: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
    functionName: "totalEntries",
    args: [BigInt(Number(mint.tokenId))],
  });

  const { data: userEntries, isFetched: hasUserEntries } = useReadContract({
    abi: EmojiBitsABI,
    address: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
    functionName: "userEntryByAddress",
    args: [[BigInt(Number(mint.tokenId))], address],
    query: {
      enabled: isConnected,
    },
  });

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
