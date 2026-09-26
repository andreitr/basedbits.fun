import { LUCKY_GHOULS_ADDRESS } from "@/app/lib/contracts/luckyghouls";
import { readGhoulsDrawings } from "@/app/lib/luckyghouls/readGhoulsDrawings";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type {
  ClaimableDrawing,
  GhoulsDrawings,
} from "@/app/lib/luckyghouls/readGhoulsDrawings";

const queryKey = ["ghoulsDrawings", LUCKY_GHOULS_ADDRESS];

// Megapot drawing state plus the treasury's ticket purchases and unclaimed tickets
export const useGhoulsDrawings = (options: { enabled?: boolean } = {}) => {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    enabled,
    refetchInterval: 30_000,
    queryFn: () => readGhoulsDrawings(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    invalidate,
  };
};
