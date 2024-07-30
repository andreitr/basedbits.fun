import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";

const CACHED_IDS_TOKENS = new Map<number, string>();

export async function getTokenIdAtIndex(index: number) {
  if (CACHED_IDS_TOKENS.has(index)) {
    return CACHED_IDS_TOKENS.get(index);
  }

  const data: any = await readContract(baseConfig, {
    abi: BBitsTokenAbi,
    address: process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
    functionName: "getTokenIdAtIndex",
    args: [index],
  });

  const tokenId = data.toString();
  CACHED_IDS_TOKENS.set(index, tokenId);
  return tokenId;
}
