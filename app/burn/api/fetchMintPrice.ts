import {Contract} from "ethers";
import {BurnedBitsABI} from "@/app/lib/abi/BurnedBits.abi";
import {baseProvider} from "@/app/lib/Web3Configs";

const minter = new Contract(
    process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS as `0x${string}`,
    BurnedBitsABI,
    baseProvider,
);

export const fetchMintPrice = async () => {
    try {
        const mintPriceFn = minter.getFunction("mintPriceInWETH");
        return await mintPriceFn.staticCall();
    } catch (error) {
        console.error("Error fetching price:", error);
    }
};
