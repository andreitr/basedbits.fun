"use client";

import Image from "next/image";
import rightArrow from "@/app/lib/icons/arrow-right.svg";
import { ApproveNFT } from "@/app/token/components/ApproveNFT";
import { TokenList } from "@/app/token/components/TokenList";
import { useState } from "react";
import { useModal } from "connectkit";
import { Button } from "@/app/lib/components/Button";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { NFTGridSkeleton } from "@/app/lib/components/NFTGrid";
import { useWallet } from "@/app/lib/Web3Provider";

// Every state is at least this tall and the wallet-restoring placeholder is exactly this tall, so the footer stays
// put whether the visitor turns out to be connected or not
const sectionClass =
  "flex flex-col items-center w-full bg-[#DDF5DD] px-5 sm:px-10 py-8 min-h-[300px]";

const REDEEM = "redeem";
const DEPOSIT = "deposit";

export const TokenSwap = () => {
  const [tab, setTab] = useState(DEPOSIT);
  const { isReady, isConnected, address } = useWallet();
  const { setOpen } = useModal();

  if (!isReady) {
    return (
      <div className={`${sectionClass} h-[300px] overflow-hidden`}>
        <div className="flex flex-col gap-6 container max-w-screen-lg">
          <div className="flex flex-row gap-2 animate-pulse">
            <div className="w-full h-[112px] rounded-lg bg-[#ABBEAC]" />
            <div className="w-full h-[112px] rounded-lg bg-[#ABBEAC] bg-opacity-20" />
          </div>
          <NFTGridSkeleton count={5} tileClassName="bg-[#ABBEAC]" />
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={sectionClass}>
        <div className="flex flex-col gap-4 container max-w-screen-lg">
          <ConnectAction action={"swap tokens"} />
          <Button
            className="sm:w-auto sm:self-start"
            onClick={() => setOpen(true)}
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={sectionClass}>
      <div className="flex flex-col gap-6 container max-w-screen-lg">
        <div className="flex flex-row gap-2 justify-center">
          <div
            className={`w-full cursor-pointer bg-[#ABBEAC] rounded-lg p-4 items-center ${tab === REDEEM ? "bg-opacity-20" : ""}`}
            onClick={() => setTab(DEPOSIT)}
          >
            <div className="flex flex-row justify-center items-center gap-4">
              <Image
                className={`w-[70px] h-[70px] rounded-full border-4 z-10 ${tab === REDEEM ? "border-white" : "border-black"}`}
                src="https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/base-mainnet/9dc7b7770bb8c29a9135fcab38ff39e5"
                width={80}
                height={80}
                alt="Token"
              />
              <Image
                src={rightArrow}
                alt="Arrow"
                className={`lg:block hidden ${tab === REDEEM ? "invert" : ""}`}
              />
              <Image
                className={`w-[70px] h-[70px] rounded-full border-4 lg:ml-0 ml-[-30px] z-0 ${tab === REDEEM ? "border-white" : "border-black"}`}
                src="/images/icon.png"
                width={80}
                height={80}
                alt="Token"
              />
            </div>
          </div>
          <div
            className={`w-full cursor-pointer bg-[#ABBEAC] rounded-lg p-4 items-center ${tab === DEPOSIT ? "bg-opacity-20" : ""}`}
            onClick={() => setTab(REDEEM)}
          >
            <div className="flex flex-row justify-center items-center gap-4">
              <Image
                className={`w-[70px] h-[70px] rounded-full border-4 z-10 ${tab === DEPOSIT ? "border-white" : "border-black"}`}
                src="/images/icon.png"
                width={80}
                height={80}
                alt="Token"
              />
              <Image
                src={rightArrow}
                alt="Arrow"
                className={`lg:block hidden ${tab === DEPOSIT ? "invert" : ""}`}
              />
              <Image
                className={`w-[70px] h-[70px] rounded-full border-4 lg:ml-0 ml-[-30px] z-0 ${tab === DEPOSIT ? "border-white" : "border-black"}`}
                src="https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/base-mainnet/9dc7b7770bb8c29a9135fcab38ff39e5"
                width={80}
                height={80}
                alt="Token"
              />
            </div>
          </div>
        </div>

        {tab === REDEEM && (
          <div>
            <TokenList
              action="REDEEM"
              address="0x553C1f87C2EF99CcA23b8A7fFaA629C8c2D27666"
              label="in token treasury"
            />
          </div>
        )}

        {tab === DEPOSIT && (
          <div>
            <ApproveNFT />
            <TokenList action="SWAP" address={address} label="in your wallet" />
          </div>
        )}
      </div>
    </div>
  );
};
