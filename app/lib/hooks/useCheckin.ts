import { getCheckin } from "@/app/lib/api/getCheckin";
import { useQuery } from "@tanstack/react-query";
import { CHECKIN_QKS } from "@/app/lib/constants";

interface Props {
  address: string | undefined;
  enabled: boolean;
}

export const useCheckin = ({ address, enabled }: Props) => {
  return useQuery({
    queryKey: [CHECKIN_QKS.CHECKINS, address],
    queryFn: async () => getCheckin(address as string),
    enabled: enabled,
    staleTime: 86400000, // 24 hours
  });
};
