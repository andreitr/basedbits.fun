import { getFrameMessage } from "frames.js";
import { transaction } from "frames.js/core";
import { encodeFunctionData } from "viem";
import { BBitsCheckInABI } from "@/app/lib/abi/BBitsCheckIn.abi";

export async function POST(req: Request) {
  const data = await req.json();
  const message = await getFrameMessage(data, { fetchHubContext: false });

  const btnIdx = message?.buttonIndex || 0;

  if (btnIdx === 2) {
    return transaction({
      chainId: "eip155:8453",
      method: "eth_sendTransaction",
      params: {
        abi: BBitsCheckInABI as any,
        to: process.env.NEXT_PUBLIC_BB_CHECKINS_ADDRESS as `0x${string}`,
        data: encodeFunctionData({
          abi: BBitsCheckInABI,
          functionName: "checkIn",
        }),
      },
    });
  }
}
