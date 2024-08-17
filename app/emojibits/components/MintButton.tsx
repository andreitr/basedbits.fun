"use client";

import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ConnectAction } from "@/app/lib/components/ConnectAction";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";
import { humanizeNumber } from "@/app/lib/utils/numberUtils";
import { BigNumberish, formatUnits } from "ethers";
import { AlchemyToken } from "@/app/lib/types/alchemy";

interface Props {
  token: AlchemyToken;
}

export const MintButton = ({ token }: Props) => {
  const { isConnected, address } = useAccount();
  const { data, writeContract } = useWriteContract();
  const { isFetching, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  });

  const { data: mintPrice, isFetched: hasMintPrice } = useReadContract({
    abi: EmojiBitsABI,
    address: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
    functionName: "userMintPrice",
    args: [address],
    query: {
      enabled: isConnected,
    },
  });

  const mint = () => {
    writeContract({
      abi: EmojiBitsABI,
      address: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
      functionName: "mint",
      value: mintPrice as any,
    });
  };

  const label = hasMintPrice
    ? `Mint for ${humanizeNumber(Number(formatUnits(mintPrice as BigNumberish)))}E`
    : `Calculating your mint price...`;

  if (!isConnected) {
    return <ConnectAction action={"to mint"} />;
  }

  return (
    <div>
      <button
        onClick={mint}
        className="bg-[#000000] w-full text-white text-lg font-bold py-2 px-4 rounded-lg"
        disabled={!hasMintPrice}
      >
        {isFetching ? "Minting..." : label}
      </button>
      {isSuccess && (
        <div className="mt-4 text-sm">
          You have minted {token.name}! Please note that streak discount only
          applies to the first mint.
        </div>
      )}
    </div>
  );
};
