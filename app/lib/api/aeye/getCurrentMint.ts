import { AEYEAbi } from "@/app/lib/abi/AEYE.abi";
import { baseConfig } from "@/app/lib/Web3Configs";
import { readContract } from "@wagmi/core";

export async function getCurrentMint() {
  const data: any = await readContract(baseConfig, {
    abi: AEYEAbi,
    address: process.env.NEXT_PUBLIC_AEYE_ADDRESS as `0x${string}`,
    functionName: "currentMint",
  });

  return Number(data);
}
