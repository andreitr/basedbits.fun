import { useQuery } from "@tanstack/react-query";
import { getMessage } from "@/app/lib/api/messages/getMessage";
import { DBMessage } from "@/app/lib/types/types";

export function useMessage(hash?: string) {
    return useQuery<DBMessage | null>({
        queryKey: ["message", hash],
        queryFn: () => getMessage(hash!),
        enabled: !!hash,
    });
}
