import { getFrameMessage } from "frames.js";
import { transaction } from "frames.js/core";
import { encodeFunctionData } from "viem";
import { BurnedBitsABI } from "@/app/lib/abi/BurnedBits.abi";
import { fetchMintPrice } from "@/app/burn/api/fetchMintPrice";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const data = await req.json();
  const message = await getFrameMessage(data, { fetchHubContext: false });

  const btnIdx = message?.buttonIndex || 0;

  if (btnIdx === 2) {
    const mintPrice = await fetchMintPrice();

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
        value: mintPrice.toString(),
      },
    });
  }
}
