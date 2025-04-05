import { useQuery } from "@tanstack/react-query";
import { getMessage } from "@/app/lib/api/messages/getMessage";
import { DBMessage } from "@/app/lib/types/types";

export function useMessage(id?: number) {
  return useQuery<DBMessage | null>({
    queryKey: ["message", id],
    queryFn: () => getMessage(id!),
    enabled: !!id,
  });
}
