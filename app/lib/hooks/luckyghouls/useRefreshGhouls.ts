import { LUCKY_GHOULS_ADDRESS } from "@/app/lib/contracts/luckyghouls";
import { useGhoulsStats } from "@/app/lib/hooks/luckyghouls/useGhoulsStats";
import { useQueryClient } from "@tanstack/react-query";

// Alchemy can take a few seconds to index a mint or burn, so the owner list is refetched again after a delay
const NFT_REINDEX_DELAY_MS = 6_000;

export const useRefreshGhouls = () => {
  const queryClient = useQueryClient();
  const { invalidate: invalidateStats } = useGhoulsStats({ enabled: false });

  return () => {
    invalidateStats();
    const invalidateNFTs = () =>
      queryClient.invalidateQueries({
        queryKey: ["getNFTsForOwner", LUCKY_GHOULS_ADDRESS],
      });
    invalidateNFTs();
    setTimeout(invalidateNFTs, NFT_REINDEX_DELAY_MS);
  };
};
