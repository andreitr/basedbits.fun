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
import { Button } from "@/app/lib/components/Button";
import { useEffect } from "react";

interface Props {
  token: AlchemyToken;
  revalidate: () => void;
}

export const MintButton = ({ token, revalidate }: Props) => {
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

  useEffect(() => {
    if (isSuccess) {
      revalidate();
    }
  }, [isSuccess, revalidate]);

  const label = hasMintPrice
    ? `Mint for ${humanizeNumber(Number(formatUnits(mintPrice as BigNumberish)))}E`
    : `Calculating your mint price...`;

  if (!isConnected) {
    return <ConnectAction action={"to mint"} />;
  }

  return (
    <div>
      <Button onClick={mint} loading={isFetching}>
        {isFetching ? "Minting..." : label}
      </Button>

      {isSuccess && (
        <div className="mt-4 text-sm">
          <div>You have minted {token.name} and entered this raffle!</div>
          <div>The streak discount applies only to the first mint.</div>
        </div>
      )}
    </div>
  );
};
