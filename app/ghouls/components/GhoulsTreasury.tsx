"use client";

import { plural } from "@/app/ghouls/components/GhoulsStats";
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
import { LuckyGhoulsABI } from "@/app/lib/abi/LuckyGhouls.abi";
import { LUCKY_GHOULS_ADDRESS } from "@/app/lib/contracts/luckyghouls";
import { revertName } from "@/app/lib/luckyghouls/revertName";
import clsx from "clsx";
import { useModal } from "connectkit";
import toast from "react-hot-toast";
import { zeroAddress } from "viem";
import {
  useAccount,
  useChainId,
  useSimulateContract,
  useSwitchChain,
} from "wagmi";
import { base } from "wagmi/chains";

const buttonClass = "w-full sm:w-auto sm:min-w-[220px] text-base";

// Connects the wallet or switches to Base before running `onClick`
export const ActionButton = ({
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

const REVERT_MESSAGES: Record<string, string> = {
  InsufficientUSDCForTicket:
    "Today's budget buys less than one Megapot ticket. The treasury needs more mints.",
  InsufficientTreasury: "The treasury is empty.",
  TicketsAlreadyPurchased: "Today's tickets are already bought.",
  EnforcedPause: "The contract is paused.",
};

const revertMessage = (error: Error) => {
  const name = revertName(error);
  return (
    (name && REVERT_MESSAGES[name]) ??
    `Buying tickets would fail${name ? ` (${name})` : ""}.`
  );
};

export const BuyTickets = () => {
  const { address } = useAccount();
  const { data: stats } = useGhoulsStats();
  const { data: drawings } = useGhoulsDrawings();
  const refresh = useRefreshGhouls();
  const { buyTickets, isPending, isConfirming } = useGhoulsBuyTickets(() => {
    toast.success("Tickets purchased!");
    refresh();
  });

  const resuming = !!drawings && drawings.purchaseTarget > BigInt(0);
  const daysLeft =
    !!stats && stats.completedPurchaseDays < stats.totalPurchaseDays;
  const eligible =
    !!stats &&
    !!drawings &&
    !stats.paused &&
    !drawings.ticketsBought &&
    (resuming || (daysLeft && stats.dailyEthBudget > BigInt(0)));

  // Dry-run buyTickets so a call that would revert (e.g. today's budget buys less than one ticket) is caught
  // before the wallet prompt
  const simulation = useSimulateContract({
    abi: LuckyGhoulsABI,
    address: LUCKY_GHOULS_ADDRESS,
    functionName: "buyTickets",
    chainId: base.id,
    // buyTickets does not depend on the caller, so the page can dry-run it before a wallet is connected
    account: address ?? zeroAddress,
    // A revert is deterministic, so retrying only delays showing the reason
    query: { enabled: eligible, refetchInterval: 30_000, retry: false },
  });
  const revertReason = simulation.error
    ? revertMessage(simulation.error)
    : undefined;

  if (!stats || !drawings) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const canBuy = eligible && simulation.isSuccess;

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
        {eligible && revertReason && (
          <div className="text-sm text-[#E24B4B]">{revertReason}</div>
        )}
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
        Drawing #{drawing.drawingId.toString()}:{" "}
        {plural(drawing.ticketCount, "ticket")},{" "}
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

// Claim rows for settled drawings with unclaimed tickets; renders nothing when there are none
export const ClaimWinnings = () => {
  const { data: drawings } = useGhoulsDrawings();

  if (!drawings?.claimable.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {drawings.claimable.map((drawing) => (
        <ClaimRow key={drawing.drawingId.toString()} drawing={drawing} />
      ))}
    </div>
  );
};
