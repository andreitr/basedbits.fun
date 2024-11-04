"use client";

import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { formatUnits, parseUnits } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import XIcon from "@/app/lib/icons/x.svg";
import FarcasterIcon from "@/app/lib/icons/farcaster.svg";
import CloseIcon from "@/app/lib/icons/x-mark.svg";
import Image from "next/image";
import { BurnedBitsABI } from "@/app/lib/abi/BurnedBits.abi";
import { fetchMintPrice } from "@/app/burn/api/fetchMintPrice";

interface Props {
  revalidate: () => void;
}

export const MintButton = ({ revalidate }: Props) => {
  const [refresh, setRefresh] = useState(false);
  const { isConnected, address } = useAccount();
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

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
    const interval = setInterval(fetchPrice, 6000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const socialDisplay = () => {
    const encodedText = encodeURIComponent(
      "I just minted a Burned Bit and burned a Based Bit 🔥",
    );

    toast.custom(
      (t) => (
        <div className="max-w-md w-full bg-black bg-opacity-80 rounded-lg pointer-events-auto ring-1 ring-black text-white p-5">
          <div className="flex flex-col justify-end gap-5">
            <div className="flex flex-row justify-between items-start">
              <div>Please spread the word to keep the fire burning 🔥</div>
              <button onClick={() => toast.dismiss(t.id)}>
                <Image src={CloseIcon} alt="Close" width={40} height={40} />
              </button>
            </div>
            <div className="flex flex-row mt-6 gap-6 justify-center">
              <Link
                className="flex flex-row rounded-md border-white border px-3 py-2 w-full justify-center items-center"
                href={`https://warpcast.com/~/compose?text=${encodedText}&&embeds[]=https://basedbits.fun/burn`}
                target="_blank"
              >
                Share on{" "}
                <Image
                  className="ml-3"
                  src={FarcasterIcon}
                  width={16}
                  height={16}
                  alt="Share on Farcaster"
                />
              </Link>
              <Link
                className="flex flex-row rounded-md border-white border px-3 py-2 w-full justify-center items-center"
                href={`https://x.com/intent/post?text=${encodedText}&&url=https://basedbits.fun/burn`}
                target="_blank"
              >
                Share on{" "}
                <Image
                  className="ml-3"
                  src={XIcon}
                  width={16}
                  height={16}
                  alt="Share on X"
                />
              </Link>
            </div>
          </div>
        </div>
      ),
      {
        duration: 50000,
        position: "bottom-right",
      },
    );
  };

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
      socialDisplay();
      revalidate();
      setRefresh(true);
    }
  }, [isSuccess, revalidate, refresh]);

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
        setRefresh(false);
      }}
      disabled={isFetching}
    >
      {isFetching ? "Minting..." : label}
    </button>
  );
};
