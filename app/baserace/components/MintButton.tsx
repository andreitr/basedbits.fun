"use client";

import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { formatUnits } from "ethers";
import { useEffect } from "react";
import { useRevalidateTags } from "@/app/lib/hooks/useRevalidateTags";
import { useSocialDisplay } from "@/app/lib/hooks/useSocialDisplay";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";
import toast from "react-hot-toast";

interface Props {
  mintPrice: string;
}

export const MintButton = ({ mintPrice }: Props) => {
  const { isConnected, address } = useAccount();
  const { data, writeContract, isError, error } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  const { show } = useSocialDisplay({
    message: "XXX",
    title: "XXX",
    url: "https://basedbits.fun/baserace",
  });

  const { call: revalidateTags } = useRevalidateTags();

  const mint = () => {
    writeContract({
      abi: BaseRaceAbi,
      address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
      functionName: "mint",
      value: BigInt(mintPrice),
    });
  };

  console.log(isSuccess);

  useEffect(() => {
    if (isSuccess) {
      revalidateTags([`getNFTsForOwner-${address}`]).finally(() => {
        show();
      });
    }
    if (isError) {
      toast.error("Unabled to mint NFT");
    }
  }, [isSuccess, isError, error]);

  const label = mintPrice
    ? `Mint for ${formatUnits(mintPrice, 18).slice(0, 7)}Ξ`
    : `Calculating your mint price...`;

  if (!isConnected) {
    return <ConnectAction action={"to mint"} />;
  }

  return (
    <button
      className="bg-red-500 hover:bg-red-800 text-xl font-bold py-3 px-4 rounded-lg w-full sm:w-auto"
      onClick={() => {
        mint();
      }}
      disabled={isFetching}
    >
      {isFetching ? "Minting..." : label}
    </button>
  );
};
