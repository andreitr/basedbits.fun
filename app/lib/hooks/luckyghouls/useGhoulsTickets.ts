import type {
  MegapotPage,
  MegapotTicket,
  MegapotWalletStats,
} from "@/app/lib/api/megapot";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const GHOULS_TICKETS_KEY = "ghoulsTickets";
export const GHOULS_MEGAPOT_STATS_KEY = "ghoulsMegapotStats";

const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} failed: ${response.status}`);
  return (await response.json()) as T;
};

// Treasury tickets from the Megapot Data API (via /api/ghouls), for one drawing or the full history
export const useGhoulsTickets = (round?: bigint) => {
  return useInfiniteQuery({
    queryKey: [GHOULS_TICKETS_KEY, round?.toString() ?? "all"],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      if (round !== undefined) params.set("round", round.toString());
      if (pageParam) params.set("cursor", pageParam);
      return getJson<MegapotPage<MegapotTicket>>(
        `/api/ghouls/tickets?${params}`,
      );
    },
    initialPageParam: "",
    getNextPageParam: (page) =>
      page.has_more && page.next_cursor ? page.next_cursor : undefined,
    refetchInterval: 60_000,
  });
};

export const useGhoulsMegapotStats = () => {
  return useQuery({
    queryKey: [GHOULS_MEGAPOT_STATS_KEY],
    queryFn: () => getJson<MegapotWalletStats>("/api/ghouls/stats"),
    refetchInterval: 60_000,
  });
};
