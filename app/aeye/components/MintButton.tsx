"use client";

import { AEYEAbi } from "@/app/lib/abi/AEYE.abi";
import { Button } from "@/app/lib/components/Button";
import { useSocialDisplay } from "@/app/lib/hooks/useSocialDisplay";
import { useModal } from "connectkit";
import { formatUnits } from "ethers";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

const MINT_PRICE = BigInt(0.0008 * 10 ** 18);

export const MintButton = () => {
  const { setOpen } = useModal();

  const { isConnected, address } = useAccount();
  const { data, writeContract } = useWriteContract();

  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  const { show } = useSocialDisplay({
    message: "I just minted a Burned Bit and burned a Based Bit 🔥",
    title: "Please spread the word to keep the fire burning",
    url: "https://basedbits.fun/burn",
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
  
  return (
    <Button
    className={"bg-black hover:bg-black/20 font-regular"}

      onClick={() => {
        mint();

      }}
    >
      {isFetching ? "Minting..." : label}
    </Button>
  );
};
