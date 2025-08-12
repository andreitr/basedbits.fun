"use client";

import { useBalanceOf } from "@/app/lib/hooks/potraider/useBalanceOf";
import { useUser } from "@/app/lib/hooks/useUser";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

interface Props {
  circulatingSupply: number;
  redeemValue: [bigint, bigint]; // [ethShare, usdcShare]
}

export const UserComponent = ({ redeemValue, circulatingSupply }: Props) => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalanceOf({ address: address });
  const { data: user } = useUser({
    address: address as `0x${string}`,
    enabled: isConnected,
  });

  if (!isConnected) {
    return null;
  }

  return (
    <div className="flex flex-row gap-6">
      {balance && (
        <div className="flex flex-col gap-2">
          <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
            Your Holdings
          </div>
          <div className="text-2xl ">
            {balance} Raider{balance > 1 ? "s" : ""}
          </div>
        </div>
      )}
      {balance && (
        <div className="flex flex-col gap-2">
          <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
            Total Value
          </div>
          <div className="text-2xl ">
            {Number(formatUnits(redeemValue[0] * BigInt(balance), 18)).toFixed(
              5,
            )}
            Ξ
            {Number(formatUnits(redeemValue[1] * BigInt(balance), 6)) > 0 && (
              <>
                {" "}
                +{" "}
                {Number(
                  formatUnits(redeemValue[1] * BigInt(balance), 6),
                ).toFixed(2)}{" "}
                USDC
              </>
            )}
          </div>
        </div>
      )}
      {balance && (
        <div className="flex flex-col gap-2">
          <div className="uppercase text-xs text-gray-400 flex items-center gap-1">
            Treasury Share
          </div>
          <div className="text-2xl ">
            {(Number(balance) / Number(circulatingSupply)) * 100}%
          </div>
        </div>
      )}
    </div>
  );
};
