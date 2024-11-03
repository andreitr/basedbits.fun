import { getFrameMessage } from "frames.js";
import { transaction } from "frames.js/core";
import { encodeFunctionData } from "viem";
import { BurnedBitsABI } from "@/app/lib/abi/BurnedBits.abi";
import { formatUnits, parseUnits } from "ethers";
import { fetchTokenPrice } from "@/app/lib/utils/uniswap";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const data = await req.json();
  const message = await getFrameMessage(data, { fetchHubContext: false });

  const btnIdx = message?.buttonIndex || 0;

  if (btnIdx === 2) {
    const rawMintPrice = await fetchTokenPrice();
    // Add slippage
    const mintPrice = (
      parseFloat(formatUnits(rawMintPrice, 18)) * 1.0274
    ).toString();

    return transaction({
      chainId: "eip155:8453",
      method: "eth_sendTransaction",
      params: {
        abi: BurnedBitsABI as any,
        to: process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS as `0x${string}`,
        data: encodeFunctionData({
          abi: BurnedBitsABI,
          functionName: "mint",
        }),
        value: parseUnits(mintPrice.slice(0, 7), 18).toString(),
      },
    });
  }
}
