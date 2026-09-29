"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { fetchTokenPrice } from "@/app/lib/utils/uniswap";

const formatPrice = (amount: string) =>
  formatUnits(BigInt(amount), 18).slice(0, 7);

interface Props {
  // Quote read on the server so the page renders with a real price instead of a 0.00 placeholder
  initialAmount?: string;
}

export const TokenPrice = ({ initialAmount }: Props) => {
  const [price, setPrice] = useState<string>(
    initialAmount ? formatPrice(initialAmount) : "0.00",
  );

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const amount = await fetchTokenPrice();
        if (amount) setPrice(formatPrice(amount));
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    };

    // The server already supplied a fresh quote; only poll from here on
    if (!initialAmount) fetchPrice().then();
    const interval = setInterval(fetchPrice, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [initialAmount]);

  return <span className="tabular-nums">{price}Ξ</span>;
};
