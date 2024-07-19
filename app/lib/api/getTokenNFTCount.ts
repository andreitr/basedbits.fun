import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { BBitsTokenABI } from "@/app/lib/abi/BBitsTokenABI";

export async function getTokenNFTCount() {
  const data: any = await readContract(baseConfig, {
    abi: BBitsTokenABI,
    address: process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
    functionName: "count",
  });
  return Number(data);
}
