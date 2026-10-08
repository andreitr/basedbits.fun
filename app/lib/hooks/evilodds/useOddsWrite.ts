import { EvilOddsABI } from "@/app/lib/abi/EvilOdds.abi";
import { EVIL_ODDS_ADDRESS } from "@/app/lib/contracts/evilodds";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";

interface Options {
  // Called once per successful receipt
  onSuccess?: () => void;
  errorMessage: string;
}

const useOddsWrite = ({ onSuccess, errorMessage }: Options) => {
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

export const useOddsMint = (onSuccess?: () => void) => {
  const { writeContract, onError, ...status } = useOddsWrite({
    onSuccess,
    errorMessage: "Mint failed.",
  });

  const mint = (quantity: number, mintPrice: bigint) =>
    writeContract(
      {
        abi: EvilOddsABI,
        address: EVIL_ODDS_ADDRESS,
        functionName: "mint",
        args: [BigInt(quantity)],
        value: mintPrice * BigInt(quantity),
        chainId: base.id,
      },
      { onError },
    );

  return { mint, ...status };
};

export const useOddsBurn = (onSuccess?: () => void) => {
  const { writeContract, onError, ...status } = useOddsWrite({
    onSuccess,
    errorMessage: "Burn failed.",
  });

  const burn = (tokenId: bigint) =>
    writeContract(
      {
        abi: EvilOddsABI,
        address: EVIL_ODDS_ADDRESS,
        functionName: "burn",
        args: [tokenId],
        chainId: base.id,
      },
      { onError },
    );

  return { burn, ...status };
};
