"use server";

import { Contract } from "ethers";
import { BurnedBitsABI } from "@/app/lib/abi/BurnedBits.abi";
import { baseProvider } from "@/app/lib/ethersProviders";

const minter = new Contract(
  process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS as `0x${string}`,
  BurnedBitsABI,
  baseProvider,
);

// Price in wei as a string so it passes cleanly from the server page and the action to client props/state
export const fetchMintPrice = async (): Promise<string | undefined> => {
  try {
    const mintPriceFn = minter.getFunction("mintPriceInWETH");
    const price: bigint = await mintPriceFn.staticCall();
    return price.toString();
  } catch (error) {
    console.error("Error fetching price:", error);
  }
};
