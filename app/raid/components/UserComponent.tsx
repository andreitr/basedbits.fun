"use client";

import { useBalanceOf } from "@/app/lib/hooks/potraider/useBalanceOf";
import { useCirculatingSupply } from "@/app/lib/hooks/potraider/useCirculatingSupply";
import { useRedeemValue } from "@/app/lib/hooks/potraider/useRedeemValue";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

export const UserComponent = () => {
  const { address, isConnected } = useAccount();

  const { data: balance } = useBalanceOf({ address: address });
  const { data: redeemValue } = useRedeemValue();
  const { data: circulatingSupply } = useCirculatingSupply();

  const [etValue, setEtValue] = useState(0);
  const [usdcValue, setUsdcValue] = useState(0);

  useEffect(() => {
    if (redeemValue && balance) {
      setEtValue(
        Number(formatUnits(redeemValue[0] * BigInt(balance), 18)) || 0,
      );
      setUsdcValue(
        Number(formatUnits(redeemValue[1] * BigInt(balance), 6)) || 0,
      );
    }
  }, [balance, redeemValue]);

  if (!isConnected || !balance) {
    return null;
  }
  return (
    <div className="flex flex-row gap-6">
      {balance && (
        <div className="flex flex-col gap-2">
          <div className="uppercase text-xs text-gray-600 flex items-center gap-1">
            Your Holdings
          </div>
          <div className="text-2xl ">
            {balance} Raider{balance > 1 ? "s" : ""}
          </div>
        </div>
      )}
      {balance && (
        <div className="flex flex-col gap-2">
          <div className="uppercase text-xs text-gray-600 flex items-center gap-1">
            Total Value
          </div>
          <div className="text-2xl ">
            {etValue.toFixed(5)}Ξ
            {usdcValue > 0 && `${usdcValue.toFixed(2)}USDC`}
          </div>
        </div>
      )}
      {balance && circulatingSupply && (
        <div className="hidden sm:flex flex-col gap-2">
          <div className="uppercase text-xs text-gray-600 flex items-center gap-1">
            Treasury Share
          </div>
          <div className="text-2xl ">
            {((Number(balance) / Number(circulatingSupply)) * 100).toFixed(2)}%
          </div>
        </div>
      )}
    </div>
  );
};
