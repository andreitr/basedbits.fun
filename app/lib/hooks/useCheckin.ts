import { useQuery } from "@tanstack/react-query";
import { fetchCheckin } from "@/app/lib/api/getCheckin";

interface Props {
  address: string | undefined;
  enabled: boolean;
}

export const useCheckin = ({ address, enabled }: Props) => {
  return useQuery({
    queryKey: ["checkIns", address],
    queryFn: async () => fetchCheckin(address as string),
    enabled: enabled,
    staleTime: 86400000, // 24 hours
  });
};
