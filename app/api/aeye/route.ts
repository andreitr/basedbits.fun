import { AEYEAbi } from "@/app/lib/abi/AEYE.abi";
import { getFrameMessage } from "frames.js";
import { transaction } from "frames.js/core";
import { encodeFunctionData } from "viem";

const MINT_PRICE = BigInt(0.0008 * 10 ** 18);

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const data = await req.json();
  const message = await getFrameMessage(data, { fetchHubContext: false });

  const btnIdx = message?.buttonIndex || 0;

  if (btnIdx === 2) {
    return transaction({
      chainId: "eip155:8453",
      method: "eth_sendTransaction",
      params: {
        abi: AEYEAbi as any,
        to: process.env.NEXT_PUBLIC_AEYE_ADDRESS as `0x${string}`,
        data: encodeFunctionData({
          abi: AEYEAbi,
          functionName: "mint",
        }),
        value: MINT_PRICE.toString(),
      },
    });
  }
}
