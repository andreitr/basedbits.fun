"use client";

import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useGhoulsStats } from "@/app/lib/hooks/luckyghouls/useGhoulsStats";
import { formatUnits } from "viem";

export const formatEth = (wei: bigint, digits = 6) =>
  `${Number(formatUnits(wei, 18)).toFixed(digits)}Ξ`;

export const formatUsdc = (amount: bigint, digits = 2) =>
  `${Number(formatUnits(amount, 6)).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} USDC`;

const Stat = ({
  label,
  children,
  sub,
}: {
  label: string;
  children: React.ReactNode;
  sub?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <div className="uppercase text-xs text-gray-600">{label}</div>
    <div className="text-2xl">{children}</div>
    {sub && <div className="text-xs text-gray-600">{sub}</div>}
  </div>
);

export const GhoulsStats = () => {
  const { data: stats, isError } = useGhoulsStats();

  if (isError) {
    return <div>Unable to load Ghouls stats. Try again shortly.</div>;
  }
  if (!stats) {
    return <div className="animate-pulse">Loading stats...</div>;
  }

  const burned = stats.totalMinted - stats.totalSupply;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <Stat
        label="Redeem value / Ghoul"
        sub={
          stats.redeemUsdc > BigInt(0)
            ? `+ ${formatUsdc(stats.redeemUsdc)}`
            : "updates every 30s"
        }
      >
        {formatEth(stats.redeemEth)}
      </Stat>
      <Stat label="Treasury" sub={`${stats.totalSupply} Ghouls outstanding`}>
        {formatEth(stats.treasuryEth, 5)}
      </Stat>
      <Stat label="Minted" sub={`${burned} burned`}>
        {stats.totalMinted.toString()}/{stats.maxSupply.toString()}
      </Stat>
      <Stat label="Mint price">{formatEth(stats.mintPrice)}</Stat>
      <Stat
        label="Purchase days"
        sub={`${formatEth(stats.dailyEthBudget, 5)} next daily budget`}
      >
        {stats.completedPurchaseDays.toString()}/
        {stats.totalPurchaseDays.toString()}
      </Stat>
      <Stat label="Megapot jackpot">{formatUsdc(stats.jackpot, 0)}</Stat>
      <Stat label="Next drawing">
        <CountDownToDate
          targetDate={Number(stats.nextDrawingTime)}
          message="Drawing now"
        />
      </Stat>
    </div>
  );
};
