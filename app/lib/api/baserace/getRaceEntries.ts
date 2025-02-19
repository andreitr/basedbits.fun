import { readContract } from "@wagmi/core";
import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";

export const fetchRaceEntries = async (address: string, id: number) => {
  const result: any = await readContract(baseSepoliaConfig, {
    abi: BaseRaceAbi,
    address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
    functionName: "getRaceEntries",
    args: [id, address],
  });

  return result.map((entry: any) => entry.toString()) as string[];
};
