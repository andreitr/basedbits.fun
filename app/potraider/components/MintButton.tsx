"use client";

import { PotRaiderABI } from "@/app/lib/abi/PotRaider.abi";
import { Button } from "@/app/lib/components/Button";
import { useSocialDisplay } from "@/app/lib/hooks/useSocialDisplay";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "connectkit";
import { formatUnits } from "ethers";
import { useEffect } from "react";
import {
    useAccount,
    useChainId,
    useReadContract,
    useSwitchChain,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";

export const MintButton = () => {
  const { setOpen } = useModal();
  const queryClient = useQueryClient();

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();
  const { data, writeContract } = useWriteContract();

  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  const { data: mintPrice } = useReadContract({
    abi: PotRaiderABI,
    address: process.env.NEXT_PUBLIC_RAIDER_ADDRESS as `0x${string}`,
    functionName: "mintPrice",
    chainId: baseSepolia.id,
  });

  const { show } = useSocialDisplay({
    message: `I just minted a PotRaider NFT on @basedbits!`,
    title: "Please spread the word - the raiders are coming!",
    url: "https://basedbits.fun/potraider",
  });

  const mint = () => {
    if (mintPrice) {
      writeContract({
        abi: PotRaiderABI,
        address: process.env.NEXT_PUBLIC_RAIDER_ADDRESS as `0x${string}`,
        functionName: "mint",
        args: [BigInt(1)],
        value: mintPrice,
        chainId: baseSepolia.id,
      });
    }
  };

  const label = mintPrice 
    ? `Mint for ${formatUnits(mintPrice, 18).slice(0, 7)}Ξ`
    : "Loading...";

  useEffect(() => {
    if (isSuccess) {
      show();
    }
  }, [isSuccess, show]);

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

  if (chainId !== baseSepolia.id) {
    return (
      <Button
        className={
          "bg-[#52cba1]/10 text-white/60 font-regular w-full sm:w-auto"
        }
        onClick={() => switchChain({ chainId: baseSepolia.id })}
      >
        Switch to Base Sepolia
      </Button>
    );
  }

  return (
    <Button
      className={"bg-[#52cba1]/10 font-regular w-full sm:w-auto"}
      onClick={() => {
        mint();
      }}
      loading={!mintPrice || isFetching}
    >
      {isFetching ? "Minting..." : label}
    </Button>
  );
}; 