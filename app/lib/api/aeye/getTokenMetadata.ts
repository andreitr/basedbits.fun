import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { readContract } from "@wagmi/core";
import { AEYEAbi } from "@/app/lib/abi/AEYE.abi";

type AeyeAttribute = {
  trait_type: string;
  value: string;
};

export type AeyeTokenMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: AeyeAttribute[];
};

export async function getTokenMetadata(
  tokenId: number,
): Promise<AeyeTokenMetadata> {
  const data: any = await readContract(baseSepoliaConfig, {
    abi: AEYEAbi,
    address: process.env.NEXT_PUBLIC_AEYE_ADDRESS as `0x${string}`,
    functionName: "tokenMetadata",
    args: [BigInt(tokenId)],
  });

  const metadata: AeyeTokenMetadata = JSON.parse(data[0]);

  return metadata;
}
