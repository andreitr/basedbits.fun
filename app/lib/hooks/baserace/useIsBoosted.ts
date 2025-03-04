import { useQuery } from "@tanstack/react-query";
import { fetchIsBoosted } from "@/app/lib/api/baserace/getIsBoosted";
import { BASE_RACE_QKS } from "@/app/lib/constants";

interface Props {
  raceId: number;
  lapId: number;
  tokenId: number;
  enabled: boolean;
}

export const useIsBoosted = ({ raceId, lapId, tokenId, enabled }: Props) => {
  return useQuery({
    queryKey: [BASE_RACE_QKS.IS_BOOSTED, raceId, lapId, tokenId],
    queryFn: async () => await fetchIsBoosted(raceId, lapId, tokenId),
    enabled: enabled,
  });
};
