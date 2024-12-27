import {Contract, parseUnits} from "ethers";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import {baseProvider} from "@/app/lib/Web3Configs";

const quoterContract = new Contract(
    "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    Quoter.abi,
    baseProvider,
);

export const fetchTokenPrice = async () => {
    try {

        const fn = quoterContract.getFunction("quoteExactInputSingle");
        const [amountOut] = await fn.staticCall({
            tokenIn: "0x553C1f87C2EF99CcA23b8A7fFaA629C8c2D27666",
            tokenOut: "0x4200000000000000000000000000000000000006",
            fee: BigInt('3000'),
            amountIn: parseUnits("1024", 18),
            sqrtPriceLimitX96: BigInt(0),
        });

        return amountOut.toString();
    } catch (error) {
        console.error("Error fetching price:", error);
    }
};
