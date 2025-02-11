import { useQuery } from "@tanstack/react-query";
import { getRecentCheckIns } from "@/app/lib/api/getRecentCheckIns";

interface Props {
  seconds?: number;
  enabled: boolean;
}

export const useCheckins = ({ seconds, enabled }: Props) => {
  return useQuery({
    queryKey: ["checkins"],
    queryFn: async () => getRecentCheckIns(seconds),
    enabled: enabled,
    staleTime: 60000, // 5 minute
  });
};
