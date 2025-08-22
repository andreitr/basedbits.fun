"use client";

import { Tooltip } from "@/app/lib/components/client/Tooltip";
import { useBalanceOf } from "@/app/lib/hooks/potraider/useBalanceOf";
import { useCirculatingSupply } from "@/app/lib/hooks/potraider/useCirculatingSupply";
import { useRedeemValue } from "@/app/lib/hooks/potraider/useRedeemValue";
import { InfoOutline } from "@/app/lib/icons/remix";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

interface Props {
  jackpot: bigint;
}

export const UserComponent = ({ jackpot }: Props) => {
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
            Current Value
            <Tooltip
              content={
                <div className="normal-case text-sm">
                  The amount you receive if you redeem all of your Raiders.
                </div>
              }
            >
              <InfoOutline
                className="hidden sm:inline-block w-4 h-4 fill-gray-600 hover:fill-black cursor-pointer"
                aria-label="Total value info"
              />
            </Tooltip>
          </div>
          <div className="text-2xl ">
            {etValue.toFixed(5)}Ξ
            {usdcValue > 1 && ` + $${usdcValue.toFixed(2)}`}
          </div>
        </div>
      )}

      {balance && circulatingSupply && (
        <div className="hidden sm:flex flex-col gap-2">
          <div className="uppercase text-xs text-gray-600 flex items-center gap-1">
            Potential Value
            <Tooltip
              content={
                <div className="normal-case text-sm">
                  The value of your portfolio if the PotRaider protocol wins
                  today&apos;s jackpot.
                </div>
              }
            >
              <InfoOutline
                className="hidden sm:inline-block w-4 h-4 fill-gray-600 hover:fill-black cursor-pointer"
                aria-label="Potential value info"
              />
            </Tooltip>
          </div>
          <div className="text-2xl ">
            $
            {(
              Number(formatUnits(jackpot, 6)) *
              (Number(balance) / Number(circulatingSupply))
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      )}
    </div>
  );
};
