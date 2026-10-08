import { EVIL_ODDS_ADDRESS } from "@/app/lib/contracts/evilodds";
import { useOddsDrawings } from "@/app/lib/hooks/evilodds/useOddsDrawings";
import { useOddsStats } from "@/app/lib/hooks/evilodds/useOddsStats";
import {
  ODDS_MEGAPOT_STATS_KEY,
  ODDS_TICKETS_KEY,
} from "@/app/lib/hooks/evilodds/useOddsTickets";
import { useQueryClient } from "@tanstack/react-query";

// Alchemy can take a few seconds to index a mint or burn, so the owner list is refetched again after a delay
const NFT_REINDEX_DELAY_MS = 6_000;

export const useRefreshOdds = () => {
  const queryClient = useQueryClient();
  const { invalidate: invalidateStats } = useOddsStats({ enabled: false });
  const { invalidate: invalidateDrawings } = useOddsDrawings({
    enabled: false,
  });

  return () => {
    invalidateStats();
    invalidateDrawings();
    queryClient.invalidateQueries({ queryKey: [ODDS_TICKETS_KEY] });
    queryClient.invalidateQueries({ queryKey: [ODDS_MEGAPOT_STATS_KEY] });
    const invalidateNFTs = () =>
      queryClient.invalidateQueries({
        queryKey: ["getNFTsForOwner", EVIL_ODDS_ADDRESS],
      });
    invalidateNFTs();
    setTimeout(invalidateNFTs, NFT_REINDEX_DELAY_MS);
  };
};
