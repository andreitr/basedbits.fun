import { baseSepoliaConfig } from "@/app/lib/Web3Configs";
import { AEYEAbi } from "@/app/lib/abi/AEYE.abi";
import { AEYE_QKS } from "@/app/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";

interface Props {
  address: `0x${string}`;
  enabled: boolean;
}

export const useUserTotalMints = ({ address, enabled }: Props) => {
  return useQuery({
    queryKey: [AEYE_QKS.TOTAL_MINTS, address],
    queryFn: async () => {
      return await readContract(baseSepoliaConfig, {
        abi: AEYEAbi,
        address: process.env.NEXT_PUBLIC_AEYE_ADDRESS as `0x${string}`,
        functionName: "totalBalanceOf",
        args: [address],
      });
    },
    enabled: enabled,
  });
};
