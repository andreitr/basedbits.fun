import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { Bit98ABI } from "@/app/lib/abi/Bit98.abi";
import { PunkalotABI } from "@/app/lib/abi/Punkalot.abi";

export async function getPunksUserMintPrice(address: `0x${string}`) {
  const data: any = await readContract(baseConfig, {
    abi: PunkalotABI,
    address: process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS as `0x${string}`,
    functionName: "userMintPrice",
    args: [address],
  });
  return data;
}
