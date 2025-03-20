import {
  fetchRaceCount,
  getRaceCount,
} from "@/app/lib/api/baserace/getRaceCount";
import { BASE_RACE_QKS } from "@/app/lib/constants";
import { useQuery } from "@tanstack/react-query";

interface Props {
  enabled?: boolean;
  refetchInterval?: number;
}

export const useRaceCount = ({
  enabled = true,
  refetchInterval,
}: Props = {}) => {
  return useQuery({
    queryKey: [BASE_RACE_QKS.COUNT],
    queryFn: async () => await fetchRaceCount(),
    enabled,
    refetchInterval: refetchInterval || false,
  });
};
