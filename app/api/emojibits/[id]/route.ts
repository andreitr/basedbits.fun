import { getFrameMessage } from "frames.js";
import { transaction } from "frames.js/core";
import { encodeFunctionData } from "viem";
import { getEmojiUserMintPrice } from "@/app/lib/api/getEmojiUserMintPrice";
import { getEmojiMintPrice } from "@/app/lib/api/getEmojiMintPrice";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await req.json();
  const message = await getFrameMessage(data, { fetchHubContext: false });

  const btnIdx = message?.buttonIndex || 0;

  if (btnIdx === 2) {
    const mintPrice = message.address
      ? await getEmojiUserMintPrice(message.address)
      : await getEmojiMintPrice();

    return transaction({
      chainId: "eip155:8453",
      method: "eth_sendTransaction",
      params: {
        abi: EmojiBitsABI as any,
        to: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
        data: encodeFunctionData({
          abi: EmojiBitsABI,
          functionName: "mint",
        }),
        value: mintPrice.toString(),
      },
    });
  }
}
