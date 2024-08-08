"use client";

import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { BBitsRaffleABI } from "@/app/lib/abi/BBitsRaffle.abi";

export const MintButton = () => {
  const { isConnected, address } = useAccount();
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  // TODO: Replace with actual contract calls
  const { data: mintPrice, isFetched: hasMintPrice } = useReadContract({
    abi: BBitsRaffleABI,
    address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
    functionName: "isEligibleForFreeEntry",
    // functionName: "userMintPrice",
    args: [address],
    query: {
      enabled: isConnected,
    },
  });

  const mint = () => {
    // writeContract({
    //     abi: BBitsRaffleABI,
    //     address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
    //     functionName: "mint",
    //     value: mintPrice,
    // });
  };

  const label = hasMintPrice
    ? `Mint for 0.0001E`
    : `Calculating your mint price`;

  if (!isConnected) {
    return <ConnectAction action={"to mint"} />;
  }

  return (
    <button
      onClick={mint}
      className="bg-[#000000] w-full text-white text-lg font-bold py-2 px-4 rounded-lg"
      disabled={!hasMintPrice}
    >
      {isFetching ? "Minting..." : label}
    </button>
  );
};
