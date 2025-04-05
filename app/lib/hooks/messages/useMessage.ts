import { getMessage } from "@/app/lib/api/messages/getMessage";
import { useQuery } from "@tanstack/react-query";
import { DBMessage } from "@/app/lib/types/types";

export function useMessage(rand_hash?: string) {
  return useQuery<DBMessage | null>({
    queryKey: ["message", rand_hash],
    queryFn: () => (rand_hash ? getMessage(rand_hash) : null),
    enabled: !!rand_hash,
  });
}
