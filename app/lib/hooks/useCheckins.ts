import { useQuery } from "@tanstack/react-query";
import { getCheckins } from "@/app/lib/api/getCheckins";
import { CHECKIN_QKS } from "@/app/lib/constants";

interface Props {
  seconds?: number;
  enabled: boolean;
}

export const useCheckins = ({ seconds, enabled }: Props) => {
  return useQuery({
    queryKey: [CHECKIN_QKS.CHECKINS],
    queryFn: async () => getCheckins(seconds),
    enabled: enabled,
    refetchInterval: 60000, // 1 minute
  });
};
