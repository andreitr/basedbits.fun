import { baseConfig } from "@/app/lib/Web3Configs";
import { AEYEAbi } from "@/app/lib/abi/AEYE.abi";
import { AEYE_QKS } from "@/app/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";

interface Props {
  tokenId: number;
  enabled: boolean;
}

export const useMintsPerToken = ({ tokenId, enabled }: Props) => {
  return useQuery({
    queryKey: [AEYE_QKS.MINTS, tokenId],
    queryFn: async () => {
      return await readContract(baseConfig, {
        abi: AEYEAbi,
        address: process.env.NEXT_PUBLIC_AEYE_ADDRESS as `0x${string}`,
        functionName: "mintsPerToken",
        args: [BigInt(tokenId)],
      });
    },
    enabled: enabled,
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};
