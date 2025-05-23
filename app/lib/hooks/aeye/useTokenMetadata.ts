import { getTokenMetadata } from "@/app/lib/api/aeye/getTokenMetadata";
import { useQuery } from "@tanstack/react-query";

interface Props {
  tokenId?: number;
  enabled: boolean;
}

export const useTokenMetadata = ({ tokenId, enabled }: Props) => {
  return useQuery({
    queryKey: ["tokenMetadata", tokenId],
    queryFn: async () => {
      if (!tokenId) return undefined;
      return getTokenMetadata(tokenId);
    },
    enabled: enabled && tokenId !== undefined,
    staleTime: 86400000, // 24 hours
  });
};
