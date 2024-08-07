import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { BBitsTokenAbi } from "@/app/lib/abi/BBitsToken.abi";
import { BigNumberish } from "ethers";

export async function getTokenTotalSupply() {
  const data: any = await readContract(baseConfig, {
    abi: BBitsTokenAbi,
    address: process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS as `0x${string}`,
    functionName: "totalSupply",
  });
  return data as BigNumberish;
}
