import { useQuery } from "@tanstack/react-query";
import { CHECKIN_QKS } from "@/app/lib/constants";
import { DBCheckin, DBUser } from "@/app/lib/types/types";

export type CheckinWithUser = DBCheckin & { user: DBUser };

interface Props {
  enabled: boolean;
  // Server-rendered list so the first paint already has avatars
  initialData?: CheckinWithUser[];
  initialDataUpdatedAt?: number;
}

export const useCheckins = ({
  enabled,
  initialData,
  initialDataUpdatedAt,
}: Props) => {
  return useQuery({
    queryKey: [CHECKIN_QKS.CHECKINS],
    queryFn: async (): Promise<CheckinWithUser[]> => {
      const response = await fetch("/api/checkins");
      if (!response.ok) throw new Error("Unable to load check-ins");
      return response.json();
    },
    enabled: enabled,
    initialData,
    initialDataUpdatedAt,
    refetchInterval: 60000, // 1 minute
  });
};
