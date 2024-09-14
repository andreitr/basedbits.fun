import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";
import { RawMetadata } from "@/app/lib/types/types";

interface Props {
  id: number;
}

export const getNFTRawMetadata = async ({ id }: Props) => {
  const uri = await readContract(baseConfig, {
    abi: EmojiBitsABI,
    address: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as `0x${string}`,
    functionName: "uri",
    args: [id],
  });

  // Parse NFT metadata
  const base64String = (uri as any).replace(
    "data:application/json;base64,",
    "",
  );
  const jsonString = Buffer.from(base64String, "base64").toString("utf-8");

  const metadata = JSON.parse(jsonString);

  return {
    image: metadata.image,
    name: metadata.name,
    id: id,
  } as RawMetadata;
};
