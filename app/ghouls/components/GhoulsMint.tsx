"use client";

import { formatEth } from "@/app/ghouls/components/GhoulsStats";
import { Button } from "@/app/lib/components/Button";
import { useGhoulsDrawings } from "@/app/lib/hooks/luckyghouls/useGhoulsDrawings";
import { useGhoulsStats } from "@/app/lib/hooks/luckyghouls/useGhoulsStats";
import { useGhoulsMint } from "@/app/lib/hooks/luckyghouls/useGhoulsWrite";
import { useRefreshGhouls } from "@/app/lib/hooks/luckyghouls/useRefreshGhouls";
import { useModal } from "connectkit";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { formatUnits } from "viem";
import { useWallet } from "@/app/lib/Web3Provider";
import { useChainId, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";

const buttonClass =
  "bg-[#FEC94F]/10 text-white/80 hover:text-white font-regular w-full";

interface Props {
  // Server-read jackpot (USDC base units) so the sentence below renders complete and doesn't reflow once data loads
  initialTopPrize?: string;
}

export const GhoulsMint = ({ initialTopPrize }: Props) => {
  const { data: drawings } = useGhoulsDrawings();
  const topPrize =
    drawings?.topPrize ??
    (initialTopPrize ? BigInt(initialTopPrize) : undefined);
  const jackpot =
    topPrize !== undefined
      ? `$${Math.round(Number(formatUnits(topPrize, 6))).toLocaleString("en-US")}`
      : undefined;

  return (
    <div className="relative w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 sm:rounded-lg rounded-none text-white p-5">
      {/* Only on wide screens; narrower cards have no room for it beside the title */}
      <Link
        href="https://megapot.io/r/U57WDQ"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden lg:block absolute top-5 right-5"
      >
        <Image
          src="/images/powered-by-megapot.svg"
          alt="Powered by Megapot"
          width={125}
          height={34}
          className="h-[39px] w-auto"
        />
      </Link>
      <div className="flex flex-col sm:flex-row w-full gap-5">
        <div className="shrink-0">
          <Image
            src="/images/lucky_ghoul.svg"
            alt="Lucky Ghoul"
            width={300}
            height={300}
            className="w-full sm:w-[300px] h-auto rounded-lg"
            priority
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row items-center gap-3">
            <div className="sm:text-5xl text-4xl text-[#FEC94F]">
              Test Ghouls
            </div>
          </div>
          <div className="text-sm text-gray-400 pt-2">
            Ghouls summon cursed numbers every drawing, chasing a{" "}
            {jackpot ? `${jackpot} ` : ""}
            <Link
              href="https://megapot.io/r/U57WDQ"
              className="underline hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              Megapot
            </Link>{" "}
            jackpot. Burn a Ghoul to get your share of the treasury.
          </div>
          <div className="mt-auto pt-4 flex flex-col gap-4">
            <MintStats />
            <MintButton />
          </div>
        </div>
      </div>
    </div>
  );
};

const MintStat = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <div className="uppercase text-xs text-gray-400">{label}</div>
    <div className="text-base sm:text-xl">{children}</div>
  </div>
);

const MintStats = () => {
  const { data: stats } = useGhoulsStats();

  return (
    <div className="grid grid-cols-3 gap-4">
      <MintStat label="Treasury">
        {stats ? formatEth(stats.treasuryEth, 5) : "..."}
      </MintStat>
      <MintStat label="Minted">
        {stats ? `${stats.totalMinted}/${stats.maxSupply}` : "..."}
      </MintStat>
      <MintStat label="Mint price">
        {stats ? formatEth(stats.mintPrice) : "..."}
      </MintStat>
    </div>
  );
};

const MintButton = () => {
  const { setOpen } = useModal();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isReady, isConnected } = useWallet();
  const { data: stats } = useGhoulsStats();
  const refresh = useRefreshGhouls();
  const [quantity, setQuantity] = useState(1);

  const { mint, isPending, isConfirming } = useGhoulsMint(() => {
    toast.success("Ghoul minted!");
    refresh();
  });

  // Every state renders one 50px row so the card never changes height as the wallet and stats load
  if (!isReady) {
    return (
      <Button className={buttonClass} loading>
        Loading...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button className={buttonClass} onClick={() => setOpen(true)}>
        Connect to Mint
      </Button>
    );
  }

  if (chainId !== base.id) {
    return (
      <Button
        className={buttonClass}
        onClick={() => switchChain({ chainId: base.id })}
      >
        Switch to Base
      </Button>
    );
  }

  if (!stats) {
    return (
      <Button className={buttonClass} loading>
        Loading...
      </Button>
    );
  }

  const remaining = stats.maxSupply - stats.totalMinted;
  if (remaining <= BigInt(0)) {
    return (
      <Button className={buttonClass} loading>
        Sold Out
      </Button>
    );
  }
  if (stats.paused) {
    return (
      <Button className={buttonClass} loading>
        Minting Paused
      </Button>
    );
  }

  const maxQuantity = Number(
    remaining < stats.maxMintPerTx ? remaining : stats.maxMintPerTx,
  );
  const busy = isPending || isConfirming;
  const cost = formatUnits(stats.mintPrice * BigInt(quantity), 18);
  const label = isPending
    ? "Confirming..."
    : isConfirming
      ? "Minting..."
      : `Mint ${quantity} for ${Number(cost).toFixed(6)}Ξ`;

  return (
    <div className="flex flex-row gap-3 sm:gap-4 items-center w-full">
      <div className="flex shrink-0 items-center border border-[#FEC94F]/30 rounded-lg h-[50px] justify-center">
        <button
          className="px-3 py-1 text-xl text-white/80 hover:text-white disabled:text-white/30"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={busy || quantity <= 1}
        >
          -
        </button>
        <div className="px-2 w-8 text-center text-white">{quantity}</div>
        <button
          className="px-3 py-1 text-xl text-white/80 hover:text-white disabled:text-white/30"
          onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          disabled={busy || quantity >= maxQuantity}
        >
          +
        </button>
      </div>
      <Button
        className={
          busy
            ? "bg-[#FEC94F]/10 font-regular flex-1 min-w-0 max-sm:px-2 max-sm:text-base animate-pulse cursor-wait"
            : "bg-[#FEC94F]/10 font-regular flex-1 min-w-0 max-sm:px-2 max-sm:text-base"
        }
        onClick={() => mint(Math.min(quantity, maxQuantity), stats.mintPrice)}
        loading={busy}
      >
        {label}
      </Button>
    </div>
  );
};
