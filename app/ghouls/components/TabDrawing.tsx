"use client";

import { formatUsd, Stat } from "@/app/ghouls/components/GhoulsStats";
import { TicketTable } from "@/app/ghouls/components/TicketTable";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useGhoulsStats } from "@/app/lib/hooks/luckyghouls/useGhoulsStats";
import { useGhoulsDrawings } from "@/app/lib/hooks/luckyghouls/useGhoulsDrawings";
import { useGhoulsTickets } from "@/app/lib/hooks/luckyghouls/useGhoulsTickets";

const DrawingTickets = ({ drawingId }: { drawingId: bigint }) => {
  const { data, isLoading, isError } = useGhoulsTickets(drawingId);
  const tickets = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return <div className="animate-pulse">Loading tickets...</div>;
  }
  if (isError) {
    return <div>Unable to load tickets. Try again shortly.</div>;
  }
  if (tickets.length === 0) {
    return <div>No tickets bought for this drawing yet.</div>;
  }
  return <TicketTable tickets={tickets} showDrawing={false} />;
};

export const TabDrawing = () => {
  const { data: drawings, isError } = useGhoulsDrawings();
  const { data: stats } = useGhoulsStats();

  if (isError) {
    return <div>Unable to load the current drawing. Try again shortly.</div>;
  }
  if (!drawings) {
    return <div className="animate-pulse">Loading drawing...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Stat label="Megapot Drawing in">
          <CountDownToDate
            targetDate={Number(drawings.drawingTime)}
            message="Drawing now"
          />
        </Stat>
        <Stat label="Megapot Jackpot">{formatUsd(drawings.topPrize)}</Stat>
        <Stat label="Tickets purchased">
          {drawings.purchaseBought.toString()}
        </Stat>
        <Stat label="Ghouls in play">
          {stats ? stats.totalSupply.toString() : "..."}
        </Stat>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-lg font-semibold">Treasury tickets</div>
        <DrawingTickets drawingId={drawings.currentDrawingId} />
      </div>
    </div>
  );
};
