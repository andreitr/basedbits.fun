import {readContract} from "@wagmi/core";
import {baseConfig} from "@/app/lib/Web3Configs";
import {RawMetadata} from "@/app/lib/types/types";

interface Props {
  abi: any;
  address: `0x${string}`;
  id: number;
}

export const getNFTRawMetadata = async ({ abi, id, address }: Props) => {
  const uri = await readContract(baseConfig, {
    abi,
    address,
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
