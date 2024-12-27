import { Contract, JsonRpcProvider, parseUnits } from "ethers";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import { QUOTER_ADDRESSES } from "@uniswap/sdk-core";
import { base } from "wagmi/chains";

const provider = new JsonRpcProvider(
  `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
);

const quoterContract = new Contract(
  QUOTER_ADDRESSES[base.id],
  Quoter.abi,
  provider,
);

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
