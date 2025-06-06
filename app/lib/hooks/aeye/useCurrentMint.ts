import { useQuery } from "@tanstack/react-query";
import { getCurrentMint } from "@/app/lib/api/aeye/getCurrentMint";

export const useCurrentMint = ({ enabled }: { enabled: boolean }) => {
  return useQuery({
    queryKey: ["currentMint"],
    queryFn: async () => getCurrentMint(),
    enabled,
    refetchInterval: 30000,
  });
};
