import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";

export async function getEmojiCurrentMint() {
  const data: any = await readContract(baseConfig, {
    abi: EmojiBitsABI,
    address: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
    functionName: "currentMint",
  });
  return Number(data);
}
