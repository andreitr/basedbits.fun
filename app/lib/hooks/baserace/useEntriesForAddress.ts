import { useQuery } from "@tanstack/react-query";
import { BASE_RACE_QKS } from "@/app/lib/constants";
import { fetchRaceEntries } from "@/app/lib/api/baserace/getRaceEntries";

interface Props {
  id: number;
  address?: string;
  enabled: boolean;
}

export const useEntriesForAddress = ({ address, id, enabled }: Props) => {
  return useQuery({
    queryKey: [BASE_RACE_QKS.RACE_ENTRIES, address, id],
    queryFn: async () => await fetchRaceEntries(address || "", id),
    enabled: enabled,
  });
};
