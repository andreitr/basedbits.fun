import { LUCKY_GHOULS_ADDRESS } from "@/app/lib/contracts/luckyghouls";
import { useGhoulsDrawings } from "@/app/lib/hooks/luckyghouls/useGhoulsDrawings";
import { useGhoulsStats } from "@/app/lib/hooks/luckyghouls/useGhoulsStats";
import {
  GHOULS_MEGAPOT_STATS_KEY,
  GHOULS_TICKETS_KEY,
} from "@/app/lib/hooks/luckyghouls/useGhoulsTickets";
import { useQueryClient } from "@tanstack/react-query";

// Alchemy can take a few seconds to index a mint or burn, so the owner list is refetched again after a delay
const NFT_REINDEX_DELAY_MS = 6_000;

export const useRefreshGhouls = () => {
  const queryClient = useQueryClient();
  const { invalidate: invalidateStats } = useGhoulsStats({ enabled: false });
  const { invalidate: invalidateDrawings } = useGhoulsDrawings({
    enabled: false,
  });

  return () => {
    invalidateStats();
    invalidateDrawings();
    queryClient.invalidateQueries({ queryKey: [GHOULS_TICKETS_KEY] });
    queryClient.invalidateQueries({ queryKey: [GHOULS_MEGAPOT_STATS_KEY] });
    const invalidateNFTs = () =>
      queryClient.invalidateQueries({
        queryKey: ["getNFTsForOwner", LUCKY_GHOULS_ADDRESS],
      });
    invalidateNFTs();
    setTimeout(invalidateNFTs, NFT_REINDEX_DELAY_MS);
  };
};
