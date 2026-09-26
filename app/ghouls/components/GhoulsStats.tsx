"use client";

import { useGhoulsStats } from "@/app/lib/hooks/luckyghouls/useGhoulsStats";
import { formatUnits } from "viem";

export const formatEth = (wei: bigint, digits = 6) =>
  `${Number(formatUnits(wei, 18)).toFixed(digits)}Ξ`;

export const formatUsdc = (amount: bigint, digits = 2) =>
  `${Number(formatUnits(amount, 6)).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} USDC`;

// "1 ticket" / "2 tickets"
export const plural = (count: bigint | number, noun: string) =>
  `${count} ${noun}${count.toString() === "1" ? "" : "s"}`;

export const Stat = ({
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
      <Stat
        label="Treasury"
        sub={`${plural(stats.totalSupply, "Ghoul")} outstanding`}
      >
        {formatEth(stats.treasuryEth, 5)}
      </Stat>
      <Stat label="Minted" sub={`${burned} burned`}>
        {stats.totalMinted.toString()}/{stats.maxSupply.toString()}
      </Stat>
      <Stat label="Mint price">{formatEth(stats.mintPrice)}</Stat>
    </div>
  );
};
