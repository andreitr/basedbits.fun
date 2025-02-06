import { useQuery } from "@tanstack/react-query";
import { getCheckinEligibility } from "@/app/lib/api/getCheckinEligibility";

interface Props {
  address: string | undefined;
  enabled: boolean;
}

export const useCheckinEligibility = ({ address, enabled }: Props) => {
  return useQuery({
    queryKey: ["isEligible", address],
    queryFn: async () => await getCheckinEligibility(address as string),
    enabled: enabled,
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  });
};
