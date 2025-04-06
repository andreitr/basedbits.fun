import { supabase } from "@/app/lib/supabase/client";
import { DBMessage } from "@/app/lib/types/types";
import { useQuery } from "@tanstack/react-query";

interface Props {
  address: string | undefined;
  enabled: boolean;
}

export const useMessagesForAddress = ({ address, enabled }: Props) => {
  return useQuery({
    queryKey: ["messages", address],
    queryFn: async () => {
      if (!address) return null;

      const { data: messages, error } = await supabase
        .from("messages")
        .select("*, user:users!inner(*)")
        .eq("user.address", address.toLowerCase())
        .is("txn_hash", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        return null;
      }

      return messages as DBMessage[] | null;
    },
    enabled: enabled && !!address,
  });
};
