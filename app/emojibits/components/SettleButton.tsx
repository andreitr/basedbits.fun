import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { Button } from "@/app/lib/components/Button";
import { useEffect } from "react";

interface Props {
  revalidate: () => void;
}

export const SettleButton = ({ revalidate }: Props) => {
  const { isConnected, address } = useAccount();
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        revalidate();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, revalidate]);

  const settle = () => {
    writeContract({
      abi: EmojiBitsABI,
      address: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
      functionName: "mint",
    });
  };

  if (!isConnected) {
    return <ConnectAction action={"to start next mint"} />;
  }
  return (
    <div className="text-center">
      <Button onClick={settle} loading={isFetching}>
        {isFetching || isSuccess ? "Starting Next Mint..." : "Start Next Mint"}
      </Button>
      <div className="mt-5 text-sm text-[#677467]">
        Starting the next mint gets you the next NFT for free :)
      </div>
    </div>
  );
};
