import { getFrameMessage } from "frames.js";
import { transaction } from "frames.js/core";
import { encodeFunctionData } from "viem";
import { getBit98UserMintPrice } from "@/app/lib/api/getBit98UserMintPrice";
import { getBit98MintPrice } from "@/app/lib/api/getBit98MintPrice";
import { Bit98ABI } from "@/app/lib/abi/Bit98.abi";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const data = await req.json();
  const message = await getFrameMessage(data, { fetchHubContext: false });

  const btnIdx = message?.buttonIndex || 0;

  if (btnIdx === 2) {
    const mintPrice = message.address
      ? await getBit98UserMintPrice(message.address)
      : await getBit98MintPrice();

    return transaction({
      // TODO: Change to base mainnet 8453
      chainId: "eip155:84532",
      method: "eth_sendTransaction",
      params: {
        abi: Bit98ABI as any,
        to: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
        data: encodeFunctionData({
          abi: Bit98ABI,
          functionName: "mint",
        }),
        value: mintPrice.toString(),
      },
    });
  }
}
