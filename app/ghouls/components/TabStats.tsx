"use client";

import { formatEth, plural, Stat } from "@/app/ghouls/components/GhoulsStats";
import { ClaimWinnings } from "@/app/ghouls/components/GhoulsTreasury";
import {
  formatMegapotAmount,
  TicketTable,
} from "@/app/ghouls/components/TicketTable";
import { useGhoulsStats } from "@/app/lib/hooks/luckyghouls/useGhoulsStats";
import {
  useGhoulsMegapotStats,
  useGhoulsTickets,
} from "@/app/lib/hooks/luckyghouls/useGhoulsTickets";

const TicketHistory = () => {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGhoulsTickets();
  const tickets = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return <div className="animate-pulse">Loading tickets...</div>;
  }
  if (isError) {
    return <div>Unable to load tickets. Try again shortly.</div>;
  }
  if (tickets.length === 0) {
    return <div>No tickets bought yet.</div>;
  }
  return (
    <div className="flex flex-col gap-4">
      <TicketTable tickets={tickets} />
      {hasNextPage && (
        <button
          className="self-start text-white bg-black bg-opacity-70 py-2 px-4 rounded-md disabled:bg-opacity-30"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
};

export const TabStats = () => {
  const { data: megapot, isError } = useGhoulsMegapotStats();
  const { data: stats } = useGhoulsStats();

  return (
    <div className="flex flex-col gap-8">
      {isError ? (
        <div>Unable to load Megapot stats. Try again shortly.</div>
      ) : !megapot || !stats ? (
        <div className="animate-pulse">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Stat
            label="Tickets bought"
            sub={`over ${plural(megapot.rounds_played, "drawing")}`}
          >
            {megapot.total_tickets.toLocaleString()}
          </Stat>
          <Stat
            label="Amount won"
            sub={`${plural(megapot.total_wins, "winning ticket")}`}
          >
            {formatMegapotAmount(megapot.total_winnings)}
          </Stat>
          <Stat label="Spent on tickets">
            {formatMegapotAmount(megapot.total_spent)}
          </Stat>
          <Stat
            label="Purchase days"
            sub={`${formatEth(stats.dailyEthBudget, 5)} next daily budget`}
          >
            {stats.completedPurchaseDays.toString()}/
            {stats.totalPurchaseDays.toString()}
          </Stat>
        </div>
      )}

      <ClaimWinnings />

      <div className="flex flex-col gap-3">
        <div className="text-lg font-semibold">All tickets</div>
        <TicketHistory />
      </div>
    </div>
  );
};
