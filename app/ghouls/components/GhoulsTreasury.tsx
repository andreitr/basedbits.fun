"use client";

import { formatEth } from "@/app/ghouls/components/GhoulsStats";
import { Button } from "@/app/lib/components/Button";
import {
  ClaimableDrawing,
  useGhoulsDrawings,
} from "@/app/lib/hooks/luckyghouls/useGhoulsDrawings";
import { useGhoulsStats } from "@/app/lib/hooks/luckyghouls/useGhoulsStats";
import {
  useGhoulsBuyTickets,
  useGhoulsClaimWinnings,
} from "@/app/lib/hooks/luckyghouls/useGhoulsWrite";
import { useRefreshGhouls } from "@/app/lib/hooks/luckyghouls/useRefreshGhouls";
import clsx from "clsx";
import { useModal } from "connectkit";
import toast from "react-hot-toast";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";

const buttonClass = "w-full sm:w-auto sm:min-w-[220px] text-base";

// Connects the wallet or switches to Base before running `onClick`
const ActionButton = ({
  onClick,
  disabled,
  busy,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  children: React.ReactNode;
}) => {
  const { setOpen } = useModal();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <Button className={buttonClass} onClick={() => setOpen(true)}>
        Connect Wallet
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
  return (
    <Button
      className={clsx(
        buttonClass,
        busy && "animate-pulse cursor-wait",
        disabled && !busy && "opacity-50 cursor-not-allowed hover:bg-[#303730]",
      )}
      onClick={onClick}
      loading={disabled || busy}
    >
      {children}
    </Button>
  );
};

const BuyTickets = () => {
  const { data: stats } = useGhoulsStats();
  const { data: drawings } = useGhoulsDrawings();
  const refresh = useRefreshGhouls();
  const { buyTickets, isPending, isConfirming } = useGhoulsBuyTickets(() => {
    toast.success("Tickets purchased!");
    refresh();
  });

  if (!stats || !drawings) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const resuming = drawings.purchaseTarget > BigInt(0);
  const daysLeft = stats.completedPurchaseDays < stats.totalPurchaseDays;
  const canBuy =
    !stats.paused &&
    !drawings.ticketsBought &&
    (resuming || (daysLeft && stats.dailyEthBudget > BigInt(0)));

  const status = drawings.ticketsBought
    ? `${drawings.purchaseBought} tickets bought for drawing #${drawings.currentDrawingId}.`
    : resuming
      ? `${drawings.purchaseBought}/${drawings.purchaseTarget} tickets bought for drawing #${drawings.currentDrawingId}; buy the rest.`
      : !daysLeft
        ? "All purchase days are complete."
        : stats.dailyEthBudget > BigInt(0)
          ? `Spends ${formatEth(stats.dailyEthBudget)} of the treasury on drawing #${drawings.currentDrawingId}.`
          : "The treasury is empty.";

  const busy = isPending || isConfirming;
  const label = isPending
    ? "Confirming..."
    : isConfirming
      ? "Buying..."
      : drawings.ticketsBought
        ? "Bought Today"
        : "Buy Tickets";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="text-lg font-semibold">Today&apos;s tickets</div>
        <div className="text-sm text-gray-600">{status}</div>
      </div>
      <ActionButton onClick={buyTickets} disabled={!canBuy} busy={busy}>
        {label}
      </ActionButton>
    </div>
  );
};

const ClaimRow = ({ drawing }: { drawing: ClaimableDrawing }) => {
  const refresh = useRefreshGhouls();
  const { claimWinnings, isPending, isConfirming } = useGhoulsClaimWinnings(
    () => {
      toast.success(`Drawing #${drawing.drawingId} claimed!`);
      refresh();
    },
  );

  const busy = isPending || isConfirming;
  const label = isPending
    ? "Confirming..."
    : isConfirming
      ? "Claiming..."
      : "Claim Winnings";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="text-sm text-gray-600">
        Drawing #{drawing.drawingId.toString()}: {drawing.ticketCount} tickets,{" "}
        {drawing.winningTickets > 0 ? (
          <span className="text-[#303730] font-semibold">
            {drawing.winningTickets} winning
          </span>
        ) : (
          "no winners"
        )}
      </div>
      <ActionButton
        onClick={() => claimWinnings(drawing.drawingId)}
        busy={busy}
      >
        {label}
      </ActionButton>
    </div>
  );
};

const ClaimWinnings = () => {
  const { data: drawings } = useGhoulsDrawings();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="text-lg font-semibold">Winnings</div>
        <div className="text-sm text-gray-600">
          Claiming settles a drawing&apos;s tickets and swaps any USDC won back
          to ETH for the treasury.
        </div>
      </div>
      {!drawings ? (
        <div className="animate-pulse">Loading...</div>
      ) : drawings.claimable.length === 0 ? (
        <div className="text-sm text-gray-600">No unclaimed tickets.</div>
      ) : (
        drawings.claimable.map((drawing) => (
          <ClaimRow key={drawing.drawingId.toString()} drawing={drawing} />
        ))
      )}
    </div>
  );
};

export const GhoulsTreasury = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold">Treasury</div>
      <BuyTickets />
      <ClaimWinnings />
    </div>
  );
};
