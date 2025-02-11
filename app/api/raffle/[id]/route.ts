import { getFrameMessage } from "frames.js";
import { transaction } from "frames.js/core";
import { NextResponse } from "next/server";
import { encodeFunctionData } from "viem";
import { BBitsRaffleABI } from "@/app/lib/abi/BBitsRaffle.abi";
import { getRaffleEligibility } from "@/app/lib/api/getRaffleEligibility";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const data = await req.json();
  const message = await getFrameMessage(data, { fetchHubContext: false });

  const btnIdx = message?.buttonIndex || 0;

  if (btnIdx === 1) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/raffle/${params.id}/`,
      { status: 302 },
    );
  }

  if (btnIdx === 2) {
    const isEligible = message.address
      ? await getRaffleEligibility(message.address)
      : false;

    if (isEligible) {
      return transaction({
        chainId: "eip155:8453",
        method: "eth_sendTransaction",
        params: {
          abi: BBitsRaffleABI as any,
          to: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
          data: encodeFunctionData({
            abi: BBitsRaffleABI,
            functionName: "newFreeEntry",
          }),
        },
      });
    } else {
      return transaction({
        chainId: "eip155:8453",
        method: "eth_sendTransaction",
        params: {
          abi: BBitsRaffleABI as any,
          to: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
          data: encodeFunctionData({
            abi: BBitsRaffleABI,
            functionName: "newPaidEntry",
          }),
          value: BigInt(100000000000000).toString(),
        },
      });
    }
  }
}
