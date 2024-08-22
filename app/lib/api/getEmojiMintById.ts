import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";
import { Mint } from "@/app/lib/types/types";
import { humanizeNumber } from "@/app/lib/utils/numberUtils";
import { formatUnits } from "ethers";

interface Props {
  id: number;
}

export async function getEmojiMintById({ id }: Props) {
  const data: any = await readContract(baseConfig, {
    abi: EmojiBitsABI,
    address: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
    functionName: "mintById",
    args: [id],
  });

  const mint: Mint = {
    tokenId: data[0],
    mints: data[1],
    rewards: `${humanizeNumber(Number(formatUnits(data[2])))}Ξ`,
    burned: `${humanizeNumber(Number(formatUnits(data[3])))}Ξ`,
    winner: data[4],
    startedAt: data[5],
    settledAt: data[6],
  };
  return mint;
}
