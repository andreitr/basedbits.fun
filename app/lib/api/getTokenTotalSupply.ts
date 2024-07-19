import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { BBitsTokenABI } from "@/app/lib/abi/BBitsTokenABI";
import { BigNumberish } from "ethers";

export async function getTokenTotalSupply() {
  const data: any = await readContract(baseConfig, {
    abi: BBitsTokenABI,
    address: process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
    functionName: "totalSupply",
  });
  return data as BigNumberish;
}
