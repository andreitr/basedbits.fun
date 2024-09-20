"use client";

import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { humanizeNumber } from "@/app/lib/utils/numberUtils";
import { BigNumberish, formatUnits } from "ethers";
import { Button } from "@/app/lib/components/Button";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import XIcon from "@/app/lib/icons/x.svg";
import FarcasterIcon from "@/app/lib/icons/farcaster.svg";
import CloseIcon from "@/app/lib/icons/x-mark.svg";
import Image from "next/image";
import { RawMetadata } from "@/app/lib/types/types";
import { Bit98ABI } from "@/app/lib/abi/Bit98.abi";
import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { baseSepolia } from "wagmi/chains";

interface Props {
  meta: RawMetadata;
  revalidate: () => void;
}

export const MintButton = ({ meta, revalidate }: Props) => {
  const [refresh, setRefresh] = useState(false);
  const { isConnected, address } = useAccount();
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  const { data: mintPrice, isFetched: hasMintPrice } = useReadContract({
    abi: Bit98ABI,
    address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
    functionName: "userMintPrice",
    // TODO: Remove config and chain id in prod
    config: baseSepoliaConfig,
    chainId: baseSepolia.id,
    args: [address],
    query: {
      enabled: isConnected,
    },
  });

  const socialDisplay = () => {
    const encodedText = encodeURIComponent(
      `I just minted ${meta.name} and entered the mint raffle!`,
    );

    toast.custom(
      (t) => (
        <div className="max-w-md w-full bg-black bg-opacity-80 rounded-lg pointer-events-auto ring-1 ring-black text-white p-5">
          <div className="flex flex-col justify-end gap-5">
            <div className="flex flex-row justify-between items-start">
              <div>
                Minted {meta.name} and entered the raffle. Spread the word 🙏
              </div>
              <button onClick={() => toast.dismiss(t.id)}>
                <Image src={CloseIcon} alt="Close" width={40} height={40} />
              </button>
            </div>
            <div className="flex flex-row mt-6 gap-6 justify-center">
              <Link
                className="flex flex-row rounded-md border-white border px-3 py-2 w-full justify-center items-center"
                href={`https://warpcast.com/~/compose?text=${encodedText}&&embeds[]=https://basedbits.fun/emojibits/${meta.id}`}
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
                href={`https://x.com/intent/post?text=${encodedText}&&url=https://basedbits.fun/emojibits/${meta.id}`}
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
      abi: Bit98ABI,
      address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
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

  const label =
    hasMintPrice && mintPrice
      ? `Mint for ${humanizeNumber(Number(formatUnits(mintPrice as BigNumberish)))}Ξ`
      : `Calculating your mint price...`;

  if (!isConnected) {
    return <ConnectAction action={"to mint"} />;
  }

  return (
    <div>
      <Button
        onClick={() => {
          mint();
          setRefresh(false);
        }}
        loading={isFetching}
      >
        {isFetching ? "Minting..." : label}
      </Button>
    </div>
  );
};
