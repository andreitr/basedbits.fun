"use client";

import { AEYEAbi } from "@/app/lib/abi/AEYE.abi";
import { Button } from "@/app/lib/components/Button";
import { AEYE_QKS } from "@/app/lib/constants";
import { useSocialDisplay } from "@/app/lib/hooks/useSocialDisplay";
import { DBAeye } from "@/app/lib/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "connectkit";
import { formatUnits } from "ethers";
import { useEffect } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";

const MINT_PRICE = BigInt(0.0008 * 10 ** 18);

export const MintButton = ({ token }: { token: DBAeye }) => {
  const { setOpen } = useModal();
  const queryClient = useQueryClient();

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();
  const { data, writeContract } = useWriteContract();

  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  const { show } = useSocialDisplay({
    message: `I just minted "${token?.headline}" AEYE dispatch on @basedbits!`,
    title: "Please spread the word - the machine is watching!",
    url: "https://basedbits.fun/aeye",
  });

  const mint = () => {
    writeContract({
      abi: AEYEAbi,
      address: process.env.NEXT_PUBLIC_AEYE_ADDRESS as `0x${string}`,
      functionName: "mint",
      value: MINT_PRICE,
    });
  };

  const label = `Mint for ${formatUnits(MINT_PRICE, 18).slice(0, 7)}Ξ`;

  useEffect(() => {
    if (isSuccess && token) {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [AEYE_QKS.REWARDS, token.id],
        }),
        queryClient.invalidateQueries({
          queryKey: [AEYE_QKS.MINTS, token.id],
        }),
        queryClient.invalidateQueries({
          queryKey: [AEYE_QKS.USER_REWARDS],
        }),
        queryClient.invalidateQueries({
          queryKey: [AEYE_QKS.STREAK],
        }),
        queryClient.invalidateQueries({
          queryKey: [AEYE_QKS.TOTAL_MINTS],
        }),
      ]).then(() => {
        show();
      });
    }
  }, [isSuccess, token]);

  if (!isConnected) {
    return (
      <Button
        className={
          "bg-[#52cba1]/10 text-white/80 hover:text-white font-regular sm:w-auto"
        }
        onClick={() => setOpen(true)}
      >
        Connect to Mint
      </Button>
    );
  }

  if (chainId !== base.id) {
    return (
      <Button
        className={
          "bg-[#52cba1]/10 text-white/60 font-regular w-full sm:w-auto"
        }
        onClick={() => switchChain({ chainId: base.id })}
      >
        Switch to Base
      </Button>
    );
  }

  return (
    <Button
      className={"bg-[#52cba1]/10 font-regular w-full sm:w-auto"}
      onClick={() => {
        mint();
      }}
    >
      {isFetching ? "Minting..." : label}
    </Button>
  );
};
