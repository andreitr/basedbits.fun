import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { BBitsRaffleABI } from "@/app/lib/abi/BBitsRaffle.abi";

export async function getRaffleEligibility(address: `0x${string}`) {
  const data: any = await readContract(baseConfig, {
    abi: BBitsRaffleABI,
    address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
    functionName: "isEligibleForFreeEntry",
    args: [address],
  });

  return Boolean(data);
}
