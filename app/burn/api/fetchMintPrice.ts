import { Contract, JsonRpcProvider } from "ethers";
import { BurnedBitsABI } from "@/app/lib/abi/BurnedBits.abi";

const provider = new JsonRpcProvider(
  `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
);

const minter = new Contract(
  process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS as `0x${string}`,
  BurnedBitsABI,
  provider,
);

export const fetchMintPrice = async () => {
  try {
    return await minter.mintPriceInWETH.staticCall();
  } catch (error) {
    console.error("Error fetching price:", error);
  }
};
