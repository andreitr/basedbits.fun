import { getAeyeById } from "@/app/lib/api/aeye/getAeyeById";
import { useQuery } from "@tanstack/react-query";

export const useAeyeById = ({ id, enabled }: { id: number | undefined; enabled: boolean }) => {
  return useQuery({
    queryKey: ["aeye", id],
    queryFn: async () => getAeyeById(id!),
    enabled: id === undefined ? false : enabled,
    staleTime: 300000
  });
};
