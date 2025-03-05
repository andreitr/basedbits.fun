import { useQuery } from "@tanstack/react-query";
import { BASE_RACE_QKS } from "@/app/lib/constants";
import { fetchLap } from "@/app/lib/api/baserace/getLap";

interface Props {
  raceId: number;
  lapId: number;
  enabled: boolean;
  refetchInterval?: number;
}

export const useLap = ({ raceId, lapId, enabled, refetchInterval }: Props) => {
  return useQuery({
    queryKey: [BASE_RACE_QKS.LAP, raceId, lapId],
    queryFn: async () => await fetchLap(raceId, lapId),
    enabled: enabled,
    refetchInterval: refetchInterval || false,
  });
};
