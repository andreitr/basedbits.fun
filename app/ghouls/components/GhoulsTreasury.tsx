"use client";

import { formatEth, plural } from "@/app/ghouls/components/GhoulsStats";
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
import clsx from "clsx";
import { useModal } from "connectkit";
import toast from "react-hot-toast";
import { BaseError, ContractFunctionRevertedError, zeroAddress } from "viem";
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
  const reverted =
    error instanceof BaseError
      ? error.walk((e) => e instanceof ContractFunctionRevertedError)
      : undefined;
  const name =
    reverted instanceof ContractFunctionRevertedError
      ? reverted.data?.errorName
      : undefined;
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

  const status = drawings.ticketsBought
    ? `${plural(drawings.purchaseBought, "ticket")} bought for drawing #${drawings.currentDrawingId}.`
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

export const ClaimWinnings = () => {
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
