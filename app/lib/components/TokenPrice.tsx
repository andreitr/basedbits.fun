"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "ethers";
import { fetchTokenPrice } from "@/app/lib/utils/uniswap";

export const TokenPrice = () => {
  const [price, setPrice] = useState<string>("0.00");

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const amount = await fetchTokenPrice();
        setPrice(formatUnits(amount, 18).slice(0, 7));
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    };

    // Fetch price every 3 seconds
    fetchPrice().then();
    const interval = setInterval(fetchPrice, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return <>{price}Ξ</>;
};
