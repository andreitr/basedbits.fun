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
import { BASE_RACE_QKS } from "@/app/lib/constants";
import { BaseRace } from "@/app/lib/types/types";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  mintPrice: string;
  race: BaseRace;
}

export const MintButton = ({ mintPrice, race }: Props) => {
  const { isConnected, address } = useAccount();
  const { data, writeContract, isError, error } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId: baseSepolia.id,
  });
  const queryClient = useQueryClient();

  const { show } = useSocialDisplay({
    message: "I just entered the Base Race! Join me!",
    title: "Spread the word about the race and invite more runners to join!",
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
    if (isSuccess && data) {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [BASE_RACE_QKS.RACE_ENTRIES, address, race.id],
        }),
        queryClient.invalidateQueries({
          queryKey: [BASE_RACE_QKS.RACE, race.id],
        }),
        queryClient.invalidateQueries({
          queryKey: [BASE_RACE_QKS.LAP, race.id, race.lapCount],
        }),
      ]).then(() => {
        show();
      });
    }
    if (isError) {
      toast.error("Unable to mint NFT");
    }
  }, [isSuccess, isError, error, data, address, race.id, queryClient]);

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
      {isFetching ? "Minting..." : label}
    </Button>
  );
};
