"use client";

import { formatUsdc, Stat } from "@/app/ghouls/components/GhoulsStats";
import { BuyTickets } from "@/app/ghouls/components/GhoulsTreasury";
import { TicketTable } from "@/app/ghouls/components/TicketTable";
import { CountDownToDate } from "@/app/lib/components/client/CountDownToDate";
import { useGhoulsDrawings } from "@/app/lib/hooks/luckyghouls/useGhoulsDrawings";
import { useGhoulsTickets } from "@/app/lib/hooks/luckyghouls/useGhoulsTickets";
import { DateTime } from "luxon";

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

  if (isError) {
    return <div>Unable to load the current drawing. Try again shortly.</div>;
  }
  if (!drawings) {
    return <div className="animate-pulse">Loading drawing...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Stat
          label={`Drawing #${drawings.currentDrawingId}`}
          sub={DateTime.fromSeconds(Number(drawings.drawingTime)).toFormat(
            "LLL d, h:mm a",
          )}
        >
          <CountDownToDate
            targetDate={Number(drawings.drawingTime)}
            message="Drawing now"
          />
        </Stat>
        <Stat label="Jackpot" sub="5 + bonusball">
          {formatUsdc(drawings.topPrize, 0)}
        </Stat>
        <Stat label="Prize pool">{formatUsdc(drawings.prizePool, 0)}</Stat>
        <Stat label="Tickets sold" sub="across Megapot">
          {drawings.globalTicketsBought.toLocaleString()}
        </Stat>
      </div>

      <BuyTickets />

      <div className="flex flex-col gap-3">
        <div className="text-lg font-semibold">Treasury tickets</div>
        <DrawingTickets drawingId={drawings.currentDrawingId} />
      </div>
    </div>
  );
};
