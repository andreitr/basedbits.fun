"use client";

import type { MegapotAmount, MegapotTicket } from "@/app/lib/api/megapot";
import Link from "next/link";
import { formatUnits } from "viem";

const formatAmount = ({ amount, decimals }: MegapotAmount) =>
  `${Number(formatUnits(BigInt(amount), decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USDC`;

const Ball = ({ n, bonus }: { n: number; bonus?: boolean }) => (
  <div
    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
      bonus ? "bg-[#FEC94F] text-black" : "bg-[#303730] text-[#DDF5DD]"
    }`}
  >
    {n}
  </div>
);

export const TicketTable = ({
  tickets,
  showDrawing = true,
}: {
  tickets: MegapotTicket[];
  showDrawing?: boolean;
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="uppercase text-xs text-gray-600">
          <tr>
            {showDrawing && <th className="py-2 pr-4">Drawing</th>}
            <th className="py-2 pr-4">Numbers</th>
            <th className="py-2 pr-4">Won</th>
            <th className="py-2 pr-4">Claimed</th>
            <th className="py-2">Tx</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            const won =
              ticket.winnings_amount &&
              BigInt(ticket.winnings_amount.amount) > BigInt(0);
            return (
              <tr key={ticket.id} className="border-t border-black/10">
                {showDrawing && (
                  <td className="py-2 pr-4">#{ticket.round_id}</td>
                )}
                <td className="py-2 pr-4">
                  <div className="flex flex-row gap-1">
                    {ticket.normals.map((n) => (
                      <Ball key={n} n={n} />
                    ))}
                    <Ball n={ticket.bonusball} bonus />
                  </div>
                </td>
                <td className={`py-2 pr-4 ${won ? "font-semibold" : ""}`}>
                  {won ? formatAmount(ticket.winnings_amount!) : "–"}
                </td>
                <td className="py-2 pr-4">
                  {ticket.matched_normals === null
                    ? "–"
                    : ticket.claimed
                      ? "Yes"
                      : "No"}
                </td>
                <td className="py-2">
                  <Link
                    href={`https://basescan.org/tx/${ticket.tx_hash}`}
                    target="_blank"
                    className="underline hover:text-black text-gray-600"
                  >
                    {ticket.tx_hash.slice(0, 8)}…
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export { formatAmount as formatMegapotAmount };
