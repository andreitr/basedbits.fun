import { useQuery } from "@tanstack/react-query";
import { getCheckinAbility } from "@/app/lib/api/getCheckinAbility";

interface Props {
  address: string | undefined;
  enabled: boolean;
}

const CAN_CHECKIN_KEY = "canCheckIn";

export const useCheckinAbility = ({ address, enabled }: Props) => {
  return useQuery({
    queryKey: [CAN_CHECKIN_KEY, address],
    queryFn: async () => await getCheckinAbility(address as string),
    enabled: enabled,
  });
};
