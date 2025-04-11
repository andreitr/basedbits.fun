import { useQuery } from "@tanstack/react-query";
import { getUserDB } from "../api/getUserDB";
import { USER_QKS } from "../constants";

interface Props {
  address: string | undefined;
  enabled: boolean;
}

export const useUser = ({ address, enabled }: Props) => {
  return useQuery({
    queryKey: [USER_QKS.USER, address],
    queryFn: async () => {
      if (!address) return null;
      return getUserDB(address);
    },
    enabled: enabled && !!address,
  });
};
