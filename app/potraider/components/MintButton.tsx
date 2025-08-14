"use client";

import { PotRaiderABI } from "@/app/lib/abi/PotRaider.abi";
import { Button } from "@/app/lib/components/Button";
import { useSocialDisplay } from "@/app/lib/hooks/useSocialDisplay";
import { useModal } from "connectkit";
import { formatUnits } from "ethers";
import { useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";

export const MintButton = () => {
  const { setOpen } = useModal();

  const [quantity, setQuantity] = useState(1);

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
    chainId: base.id,
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
        args: [BigInt(quantity)],
        value: mintPrice * BigInt(quantity),
        chainId: base.id,
      });
    }
  };

  const label = mintPrice
    ? `Mint for ${formatUnits(mintPrice * BigInt(quantity), 18).slice(0, 7)}Ξ`
    : "Loading...";

  useEffect(() => {
    if (isSuccess) {
      show();
    }
  }, [isSuccess, show]);

  const increment = () => {
    setQuantity((q) => Math.min(50, q + 1));
  };

  const decrement = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };


  if (!isConnected) {
    return (
      <Button
        className={
          "bg-[#FEC94F]/10 text-white/80 hover:text-white font-regular sm:w-auto"
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
          "bg-[#FEC94F]/10 text-white/60 font-regular w-full sm:w-auto"
        }
        onClick={() => switchChain({ chainId: base.id })}
      >
        Switch to Base
      </Button>
    );
  }


  return (
    <div className="flex flex-row gap-4 items-center w-full ">
      <div className="flex items-center border border-[#FEC94F]/30 rounded-lg h-[50px]">
        <button
          className="px-3 py-1 text-xl text-white/80 hover:text-white disabled:text-white/30"
          onClick={decrement}
          disabled={quantity <= 1}
        >
          -
        </button>
        <div className="px-2 w-8 text-center text-white">{quantity}</div>
        <button
          className="px-3 py-1 text-xl text-white/80 hover:text-white disabled:text-white/30"
          onClick={increment}
          disabled={quantity >= 50}
        >
          +
        </button>
      </div>
      <Button
        className={"bg-[#FEC94F]/10 font-regular w-full sm:w-auto flex-1"}
        onClick={() => {
          mint();
        }}
        loading={!mintPrice || isFetching}
      >
        {isFetching ? "Minting..." : label}
      </Button>
    </div>
  );
};
