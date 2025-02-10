import { useQuery } from "@tanstack/react-query";
import { getRecentCheckIns } from "@/app/lib/api/getRecentCheckIns";

interface Props {
  hours?: number;
  enabled: boolean;
}

export const useCheckins = ({ hours, enabled }: Props) => {
  return useQuery({
    queryKey: ["checkins"],
    queryFn: async () => getRecentCheckIns(hours),
    enabled: enabled,
    staleTime: 60000, // 5 minute
  });
};
