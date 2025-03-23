import { useQuery } from "@tanstack/react-query";
import { getCheckins } from "../api/getCheckins";
import { CHECKIN_QKS } from "../constants";

interface Props {
  seconds?: number;
  enabled: boolean;
}

export const useCheckins = ({ seconds, enabled }: Props) => {
  return useQuery({
    queryKey: [CHECKIN_QKS.CHECKINS],
    queryFn: async () => getCheckins(seconds),
    enabled: enabled,
    staleTime: 60000, // 1 minute
  });
};
