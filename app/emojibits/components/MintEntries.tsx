"use client";

import { Mint } from "@/app/lib/types/types";
import { useAccount } from "wagmi";

interface Props {
  mint: Mint;
}

export const MintEntries = ({ mint }: Props) => {
  const { isConnected, address } = useAccount();

  const totalEntries = mint.entries.reduce(
    (acc, entry) => acc + Number(entry.weight),
    0,
  );

  if (!isConnected) {
    return (
      <>
        There are <span className="font-semibold">{totalEntries}</span> raffle
        entries.
      </>
    );
  }

  const yourEntries = mint.entries.reduce((acc, entry) => {
    return entry.user.toLowerCase() === address?.toLowerCase()
      ? acc + Number(entry.weight)
      : acc;
  }, 0);

  return (
    <>
      You hold <span className="font-semibold">{yourEntries}</span> out of the{" "}
      <span className="font-semibold">{totalEntries}</span> total raffle
      entries.
    </>
  );
};
