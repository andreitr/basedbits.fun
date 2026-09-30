"use client";

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

const TAB_LABELS: Record<string, string> = {
  [DEPOSIT]: "Swap NFT to BBITS",
  [REDEEM]: "Swap BBITS to NFT",
};

export const TokenSwap = () => {
  const [tab, setTab] = useState(DEPOSIT);
  const { isReady, isConnected, address } = useWallet();
  const { setOpen } = useModal();

  if (!isReady) {
    return (
      <div className={`${sectionClass} h-[300px] overflow-hidden`}>
        <div className="flex flex-col gap-6 container max-w-screen-lg">
          <div className="flex flex-row gap-3 animate-pulse">
            <div className="w-40 h-10 rounded-md bg-black bg-opacity-30" />
            <div className="w-40 h-10 rounded-md bg-black bg-opacity-10" />
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
        <div className="flex flex-wrap justify-start gap-3">
          {[DEPOSIT, REDEEM].map((t) => (
            <button
              key={t}
              className={`text-white bg-black py-2 px-4 rounded-md ${tab === t ? "bg-opacity-70" : "bg-opacity-30"}`}
              onClick={() => setTab(t)}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
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
