import { Contract, formatUnits, JsonRpcProvider, parseUnits } from "ethers";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_ID;
if (!alchemyApiKey) {
  throw new Error(
    "Alchemy API key is missing. Please set NEXT_PUBLIC_ALCHEMY_ID.",
  );
}

const provider = new JsonRpcProvider(
  `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
);

interface PoolConstants {
  token0: string;
  token1: string;
  fee: number;
}

async function getPoolConstants(): Promise<PoolConstants> {
  try {
    const poolContract = new Contract(
      "0xc229495845BBB34997e2143799856Af61448582F",
      IUniswapV3PoolABI.abi,
      provider,
    );

    const [token0, token1, fee] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
    ]);

    return { token0, token1, fee };
  } catch (error) {
    console.error("Error fetching pool constants in getPoolConstants:", error);
    throw error;
  }
}

export const MintPrice = async (): Promise<string> => {
  try {
    const quoterContract = new Contract(
      "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
      Quoter["abi"],
      provider,
    );

    const poolConstants = await getPoolConstants();

    // Log the pool constants to verify correct values
    console.log("Pool constants:", poolConstants);

    // Simulate the call to quote the exact input amount
    const quotedAmountOut =
      await quoterContract.callStatic.quoteExactInputSingle(
        poolConstants.token0,
        poolConstants.token1,
        poolConstants.fee,
        parseUnits("1024", 18),
        0, // No price limit
      );

    console.log("Quoted Amount Out:", quotedAmountOut.toString());

    return formatUnits(quotedAmountOut, 18);
  } catch (error) {
    console.error("Error fetching mint price in MintPrice:", error);
    throw error;
  }
};
