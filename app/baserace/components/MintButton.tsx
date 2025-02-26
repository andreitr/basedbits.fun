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
import { Button } from "@/app/lib/components/Button";
import { baseSepolia } from "wagmi/chains";

interface Props {
  mintPrice: string;
}

export const MintButton = ({ mintPrice }: Props) => {
  const { isConnected, address } = useAccount();
  const { data, writeContract, isError, error } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId: baseSepolia.id,
  });

  const { show } = useSocialDisplay({
    message: "Entered Race!",
    title: "XXX",
    url: "https://basedbits.fun/baserace",
  });

  const { call: revalidateTags } = useRevalidateTags();

  const mint = () => {
    writeContract({
      chainId: baseSepolia.id,
      abi: BaseRaceAbi,
      address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
      functionName: "mint",
      value: BigInt(mintPrice),
    });
  };

  useEffect(() => {
    if (isSuccess) {
      revalidateTags([`getNFTsForOwner-${address}`]).finally(() => {
        show();
      });
    }
    if (isError) {
      toast.error("Unable to mint NFT");
    }
  }, [isSuccess, isError, error]);

  const label = `Enter Race ${formatUnits(mintPrice, 18).slice(0, 7)}Ξ`;

  if (!isConnected) {
    return <ConnectAction action={"to mint"} />;
  }

  return (
    <Button
      onClick={() => mint()}
      loading={isFetching}
      className="flex w-[320px] items-center justify-center"
    >
      {label}
    </Button>
  );
};
