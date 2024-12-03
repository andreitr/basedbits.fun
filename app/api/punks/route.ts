import { getFrameMessage } from "frames.js";
import { transaction } from "frames.js/core";
import { encodeFunctionData } from "viem";
import { PunkalotABI } from "@/app/lib/abi/Punkalot.abi";
import { getPunksUserMintPrice } from "@/app/lib/api/getPunksUserMintPrice";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const data = await req.json();
  const message = await getFrameMessage(data, { fetchHubContext: false });

  const btnIdx = message?.buttonIndex || 0;

  if (btnIdx === 2) {
    const mintPrice = message.address
      ? await getPunksUserMintPrice(message.address)
      : "0.0015";

    return transaction({
      chainId: "eip155:8453",
      method: "eth_sendTransaction",
      params: {
        abi: PunkalotABI as any,
        to: process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS as `0x${string}`,
        data: encodeFunctionData({
          abi: PunkalotABI,
          functionName: "mint",
        }),
        value: mintPrice.toString(),
      },
    });
  }
}
