import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";
import { humanizeNumber } from "@/app/lib/utils/numberUtils";
import { formatUnits } from "ethers";

export async function getEmojiCurrentRaffleAmount() {
  const data: any = await readContract(baseConfig, {
    abi: EmojiBitsABI,
    address: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
    functionName: "currentMintRaffleAmount",
  });

  return `${humanizeNumber(Number(formatUnits(data)))}Ξ`;
}
