"use client";

import { formatUnits } from "viem";

export const formatEth = (wei: bigint, digits = 6) =>
  `${Number(formatUnits(wei, 18)).toFixed(digits)}Ξ`;

// USDC shown as whole dollars, e.g. "$214,599"
export const formatUsd = (amount: bigint) =>
  `$${Math.round(Number(formatUnits(amount, 6))).toLocaleString()}`;

export const formatUsdc = (amount: bigint, digits = 2) =>
  `${Number(formatUnits(amount, 6)).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} USDC`;

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
