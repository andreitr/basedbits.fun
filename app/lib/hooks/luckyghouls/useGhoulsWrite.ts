import { LuckyGhoulsABI } from "@/app/lib/abi/LuckyGhouls.abi";
import { LUCKY_GHOULS_ADDRESS } from "@/app/lib/contracts/luckyghouls";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";

interface Options {
  // Called once per successful receipt
  onSuccess?: () => void;
  errorMessage: string;
}

const useGhoulsWrite = ({ onSuccess, errorMessage }: Options) => {
  const { data: hash, writeContract, isPending, reset } = useWriteContract();
  const { data: receipt, isLoading: isConfirming } =
    useWaitForTransactionReceipt({ hash });
  const handledHash = useRef<string>();

  useEffect(() => {
    if (!receipt || handledHash.current === receipt.transactionHash) return;
    handledHash.current = receipt.transactionHash;

    if (receipt.status !== "success") {
      toast.error(errorMessage);
      reset();
      return;
    }
    onSuccess?.();
  }, [receipt]);

  const onError = (error: Error) => {
    if (!/user rejected|denied/i.test(error.message)) {
      // Surface the contract's custom error name when wagmi decoded one
      const reason = (error as { shortMessage?: string }).shortMessage;
      toast.error(reason ? `${errorMessage} ${reason}` : errorMessage);
    }
  };

  return {
    writeContract,
    onError,
    isPending,
    isConfirming,
    isSuccess: receipt?.status === "success",
  };
};

export const useGhoulsMint = (onSuccess?: () => void) => {
  const { writeContract, onError, ...status } = useGhoulsWrite({
    onSuccess,
    errorMessage: "Mint failed.",
  });

  const mint = (quantity: number, mintPrice: bigint) =>
    writeContract(
      {
        abi: LuckyGhoulsABI,
        address: LUCKY_GHOULS_ADDRESS,
        functionName: "mint",
        args: [BigInt(quantity)],
        value: mintPrice * BigInt(quantity),
        chainId: base.id,
      },
      { onError },
    );

  return { mint, ...status };
};

export const useGhoulsBurn = (onSuccess?: () => void) => {
  const { writeContract, onError, ...status } = useGhoulsWrite({
    onSuccess,
    errorMessage: "Burn failed.",
  });

  const burn = (tokenId: bigint) =>
    writeContract(
      {
        abi: LuckyGhoulsABI,
        address: LUCKY_GHOULS_ADDRESS,
        functionName: "burn",
        args: [tokenId],
        chainId: base.id,
      },
      { onError },
    );

  return { burn, ...status };
};

export const useGhoulsBuyTickets = (onSuccess?: () => void) => {
  const { writeContract, onError, ...status } = useGhoulsWrite({
    onSuccess,
    errorMessage: "Buying tickets failed.",
  });

  const buyTickets = () =>
    writeContract(
      {
        abi: LuckyGhoulsABI,
        address: LUCKY_GHOULS_ADDRESS,
        functionName: "buyTickets",
        chainId: base.id,
      },
      { onError },
    );

  return { buyTickets, ...status };
};

export const useGhoulsClaimWinnings = (onSuccess?: () => void) => {
  const { writeContract, onError, ...status } = useGhoulsWrite({
    onSuccess,
    errorMessage: "Claiming winnings failed.",
  });

  const claimWinnings = (drawingId: bigint) =>
    writeContract(
      {
        abi: LuckyGhoulsABI,
        address: LUCKY_GHOULS_ADDRESS,
        functionName: "claimWinnings",
        args: [drawingId],
        chainId: base.id,
      },
      { onError },
    );

  return { claimWinnings, ...status };
};
