import { Contract, parseUnits } from "ethers";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import { QUOTER_ADDRESSES } from "@uniswap/sdk-core";
import { base } from "wagmi/chains";
import { baseProvider } from "@/app/lib/Web3Configs";

const quoterContract = new Contract(
  "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
  Quoter.abi,
  baseProvider,
);

console.log(QUOTER_ADDRESSES[base.id]);

export const fetchTokenPrice = async () => {
  try {
    const params = {
      tokenIn: "0x553C1f87C2EF99CcA23b8A7fFaA629C8c2D27666",
      tokenOut: "0x4200000000000000000000000000000000000006",
      amountIn: parseUnits("1024", 18),
      fee: BigInt("3000"),
      sqrtPriceLimitX96: 0,
    };
    const amount =
      await quoterContract.quoteExactInputSingle.staticCall(params);
    return amount[0].toString();
  } catch (error) {
    console.error("Error fetching price:", error);
  }
};
