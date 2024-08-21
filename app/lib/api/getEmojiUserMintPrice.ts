import { readContract } from "@wagmi/core";
import { baseTestnetConfig } from "@/app/lib/Web3Configs";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";

export async function getEmojiUserMintPrice(address: string) {
  const data: any = await readContract(baseTestnetConfig, {
    abi: EmojiBitsABI,
    address: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
    functionName: "userMintPrice",
    args: [address],
  });
  return data;
}
