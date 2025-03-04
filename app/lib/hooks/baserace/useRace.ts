import { useQuery } from "@tanstack/react-query";
import { BASE_RACE_QKS } from "@/app/lib/constants";
import { fetchRace } from "@/app/lib/api/baserace/getRace";

interface Props {
  id: number;
  enabled: boolean;
  refetchInterval?: number;
}

export const useRace = ({ id, enabled, refetchInterval }: Props) => {
  return useQuery({
    queryKey: [BASE_RACE_QKS.RACE, id],
    queryFn: async () => await fetchRace(id),
    enabled: enabled,
    refetchInterval: refetchInterval || false,
  });
};
