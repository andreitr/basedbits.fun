import { EVIL_ODDS_ADDRESS } from "@/app/lib/contracts/evilodds";
import { readOddsDrawings } from "@/app/lib/evilodds/readOddsDrawings";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type {
  ClaimableDrawing,
  OddsDrawings,
} from "@/app/lib/evilodds/readOddsDrawings";

const queryKey = ["oddsDrawings", EVIL_ODDS_ADDRESS];

// Megapot drawing state plus the treasury's ticket purchases and unclaimed tickets
export const useOddsDrawings = (options: { enabled?: boolean } = {}) => {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    enabled,
    refetchInterval: 30_000,
    queryFn: () => readOddsDrawings(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    invalidate,
  };
};
