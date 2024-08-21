import { readContract } from "@wagmi/core";
import { baseTestnetConfig } from "@/app/lib/Web3Configs";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";
import { Mint } from "@/app/lib/types/types";

interface Props {
  id: number;
}

export async function getEmojiMintById({ id }: Props) {
  const data: any = await readContract(baseTestnetConfig, {
    abi: EmojiBitsABI,
    address: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
    functionName: "raffleInfo",
    args: [id],
  });

  const mint: Mint = {
    tokenId: data[0],
    mints: data[1],
    rewards: data[2],
    burned: data[3],
    winner: data[4],
    startedAt: data[5],
    settledAt: data[6],
  };
  return mint;
}
