import { readContract } from "@wagmi/core";
import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { BaseRaceAbi } from "@/app/lib/abi/BaseRace.abi";

export const fetchIsBoosted = async (
  raceId: number,
  lapId: number,
  tokenId: number,
) => {
  const result: any = await readContract(baseSepoliaConfig, {
    abi: BaseRaceAbi,
    address: process.env.NEXT_PUBLIC_BASERACE_ADDRESS as `0x${string}`,
    functionName: "isBoosted",
    args: [raceId, lapId, tokenId],
  });

  return result;
};
