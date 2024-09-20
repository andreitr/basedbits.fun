import { readContract } from "@wagmi/core";
import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { Mint } from "@/app/lib/types/types";
import { humanizeNumber } from "@/app/lib/utils/numberUtils";
import { formatUnits } from "ethers";
import { Bit98ABI } from "@/app/lib/abi/Bit98.abi";

interface Props {
  id: number;
}

export async function getBit98MintById({ id }: Props) {
  const data: any = await readContract(baseSepoliaConfig, {
    abi: Bit98ABI,
    address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
    functionName: "mintById",
    args: [id],
  });

  const mint: Mint = {
    tokenId: data[0],
    mints: data[2],
    rewards: `${humanizeNumber(Number(formatUnits(data[3])))}Ξ`,
    burned: `${humanizeNumber(Number(formatUnits(data[4])))}Ξ`,
    winner: data[5],
    startedAt: data[6],
    settledAt: data[7],
  };

  return mint;
}
