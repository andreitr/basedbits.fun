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
import { baseSepolia } from "wagmi/chains";

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
    message: `I just minted an AEYE ${token?.id} dispatch on Based Bits!`,
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
      ]).then(() => {
        console.log("invalidated");
        show();
      });
    }
  }, [isSuccess, token]);

  if (!isConnected) {
    return (
      <Button
        className={"bg-black/20 hover:bg-black text-white/60 font-regular"}
        onClick={() => setOpen(true)}
      >
        Connect to Mint
      </Button>
    );
  }

  if (chainId !== baseSepolia.id) {
    return (
      <Button
        className={"bg-black/20 hover:bg-black text-white/60 font-regular"}
        onClick={() => switchChain({ chainId: baseSepolia.id })}
      >
        Switch to Base Sepolia
      </Button>
    );
  }
  
  return (
    <Button
      className={"bg-black hover:bg-black hover:text-white font-regular"}
      onClick={() => {
        mint();
      }}
    >
      {isFetching ? "Minting..." : label}
    </Button>
  );
};
