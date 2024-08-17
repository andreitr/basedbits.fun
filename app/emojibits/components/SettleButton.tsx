import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";

export const SettleButton = () => {
  const { isConnected, address } = useAccount();
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

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
    <button
      onClick={settle}
      className="bg-[#000000] w-full text-white text-lg font-bold py-2 px-4 rounded-lg"
      disabled={isFetching}
    >
      {isFetching
        ? "Settling..."
        : "Start Next Mint (you get first NFT for free)"}
    </button>
  );
};
