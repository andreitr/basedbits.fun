import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { readContract } from "@wagmi/core";
import { AEYEAbi } from "../../abi/AEYE.abi";

export async function getCurrentMint() {
  const data: any = await readContract(baseSepoliaConfig, {
    abi: AEYEAbi,
    address: process.env.NEXT_PUBLIC_AEYE_ADDRESS as `0x${string}`,
    functionName: "currentMint",
  });

  return Number(data);
}
