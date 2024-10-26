import { Contract, formatUnits, JsonRpcProvider, parseUnits } from "ethers";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";

const provider = new JsonRpcProvider(
  `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
);

export const TokenPrice = async () => {
  const quoterContract = new Contract(
    "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    Quoter.abi,
    provider,
  );

  const poolConstants = await getPoolConstants();

  const params = {
    tokenIn: poolConstants.token1,
    tokenOut: poolConstants.token0,
    amountIn: parseUnits("1024", 18),
    fee: poolConstants.fee,
    sqrtPriceLimitX96: 0,
  };
  const amount = await quoterContract.quoteExactInputSingle.staticCall(params);

  return (
    <div>Mint Price: {formatUnits(amount[0].toString(), 18).slice(0, 6)}Ξ</div>
  );
};

async function getPoolConstants(): Promise<{
  token0: string;
  token1: string;
  fee: number;
}> {
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

  return {
    token0,
    token1,
    fee,
  };
}
