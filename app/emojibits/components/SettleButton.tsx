import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { Button } from "@/app/lib/components/Button";
import { useEffect } from "react";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { useRouter } from "next/navigation";

interface Props {
  token: AlchemyToken;
}

export const SettleButton = ({ token }: Props) => {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (isSuccess) {
      router.push(`/emojibits/${Number(token.tokenId) + 1}`);
    }
  }, [isSuccess]);

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
        {isFetching ? "Settling..." : "Start Next Mint"}
      </Button>
      <div className="mt-5 text-sm text-[#677467]">
        Starting the next mint gets you the next Emoji Bit for free :)
      </div>
    </div>
  );
};
