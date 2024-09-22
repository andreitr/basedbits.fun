import {readContract} from "@wagmi/core";
import {baseConfig} from "@/app/lib/Web3Configs";
import {Bit98ABI} from "@/app/lib/abi/Bit98.abi";

export async function getBit98MintPrice() {
  const data: any = await readContract(baseConfig, {
    abi: Bit98ABI,
    address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
    functionName: "mintPrice",
  });
  return data;
}
