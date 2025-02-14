"use client";

import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BurnedBitsABI } from "@/app/lib/abi/BurnedBits.abi";
import { fetchMintPrice } from "@/app/burn/api/fetchMintPrice";
import { useRevalidateTags } from "@/app/lib/hooks/useRevalidateTags";
import { useSocialDisplay } from "@/app/lib/hooks/useSocialDisplay";
import { Button } from "@/app/lib/components/Button";
import { useModal } from "connectkit";

export const MintButton = () => {
  const { setOpen } = useModal();
  const [refresh, setRefresh] = useState(false);
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

  const { call: revalidateTags } = useRevalidateTags();

  const [mintPrice, setMintPrice] = useState<string>();

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const amount = await fetchMintPrice();
        setMintPrice(amount);
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    };
    fetchPrice().then();
    const interval = setInterval(fetchPrice, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const mint = () => {
    if (!mintPrice) {
      toast.error("Unable to calculate mint price. Please try again later.");
      return;
    }
    writeContract({
      abi: BurnedBitsABI,
      address: process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS as `0x${string}`,
      functionName: "mint",
      value: mintPrice as any,
    });
  };

  useEffect(() => {
    if (isSuccess && !refresh) {
      revalidateTags([`getNFTsForOwner-${address}`]).finally(() => {
        show();
        setRefresh(true);
      });
    }
  }, [isSuccess, refresh]);

  const label = mintPrice
    ? `Mint for ${formatUnits(mintPrice, 18).slice(0, 7)}Ξ`
    : `Calculating mint price...`;

  if (!isConnected) {
    return (
      <Button
        className={"bg-black/20 hover:bg-black text-white/70 font-regular"}
        onClick={() => setOpen(true)}
      >
        Connect to Mint
      </Button>
    );
  }

  return (
    <Button
      className={"bg-red-500 hover:bg-red-800"}
      onClick={() => {
        mint();
        setRefresh(false);
      }}
    >
      {isFetching ? "Minting..." : label}
    </Button>
  );
};
