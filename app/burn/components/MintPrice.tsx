import { Contract, JsonRpcProvider, parseUnits } from "ethers";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";

const provider = new JsonRpcProvider(
  `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
);

export const MintPrice = async () => {
  const quoterContract = new Contract(
    "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    Quoter.abi,
    provider,
  );

  const poolConstants = await getPoolConstants();

  return await quoterContract.quoteExactInputSingle.staticCall(
    poolConstants.token0,
    poolConstants.token1,
    poolConstants.fee,
    parseUnits("1024", 18),
    0,
  );

  return <div>{"TEST X"}</div>;
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
