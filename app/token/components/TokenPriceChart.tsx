"use client";

import { PointerEvent, useMemo, useState } from "react";
import {
  PricePoint,
  TokenPriceHistory,
} from "@/app/lib/api/getTokenPriceHistory";

const DAY = 24 * 60 * 60;

const RANGES = {
  "7D": { days: 7, series: "hourly" },
  "30D": { days: 30, series: "hourly" },
  "90D": { days: 90, series: "daily" },
  "1Y": { days: 365, series: "daily" },
} as const;

type Range = keyof typeof RANGES;

const formatPrice = (price: number) => `${price.toFixed(5)}Ξ`;

// Pinned to UTC so the server-rendered labels match the ones the browser hydrates with
const formatDate = (time: number, withTime = false) =>
  new Date(time * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit", hour12: false }),
    timeZone: "UTC",
  }) + (withTime ? " UTC" : "");

interface Props {
  history: TokenPriceHistory;
}

export const TokenPriceChart = ({ history }: Props) => {
  const [range, setRange] = useState<Range>("30D");
  const [hover, setHover] = useState<number | null>(null);

  const chart = useMemo(() => {
    const { days, series } = RANGES[range];
    const all = history[series];
    const end = all.at(-1)?.[0] ?? 0;
    const points = all.filter(([time]) => time >= end - days * DAY);
    if (points.length < 2) return null;

    const prices = points.map(([, price]) => price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    // Pad the domain so the line never touches the top or bottom edge
    const pad = (max - min || max) * 0.15;
    const lo = min - pad;
    const hi = max + pad;
    const start = points[0][0];

    const x = (time: number) => ((time - start) / (end - start)) * 100;
    const y = (price: number) => (1 - (price - lo) / (hi - lo)) * 100;

    const line = points
      .map(([t, p], i) => `${i ? "L" : "M"}${x(t)},${y(p)}`)
      .join("");

    return {
      points,
      x,
      y,
      line,
      area: `${line}L100,100L0,100Z`,
      ticks: [max, (max + min) / 2, min],
      first: prices[0],
      last: prices.at(-1)!,
    };
  }, [history, range]);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!chart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    // Snap to the candle nearest the pointer
    let nearest = 0;
    chart.points.forEach(([t], i) => {
      if (
        Math.abs(chart.x(t) - pct) <
        Math.abs(chart.x(chart.points[nearest][0]) - pct)
      )
        nearest = i;
    });
    setHover(nearest);
  };

  const active = chart && hover !== null ? chart.points[hover] : null;
  const change = chart ? ((chart.last - chart.first) / chart.first) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div className="text-gray-600">
          {chart ? (
            <>
              <span className="text-xl text-black font-semibold tabular-nums">
                {formatPrice(active ? active[1] : chart.last)}
              </span>{" "}
              for 1024 BBITS{" "}
              <span className="tabular-nums whitespace-nowrap">
                {active ? (
                  formatDate(active[0], RANGES[range].series === "hourly")
                ) : (
                  <>
                    {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%{" "}
                    {range}
                  </>
                )}
              </span>
            </>
          ) : (
            "Price history"
          )}
        </div>
        <div className="flex gap-2">
          {(Object.keys(RANGES) as Range[]).map((r) => (
            <button
              key={r}
              className={`text-white text-sm bg-black py-1 px-3 rounded-md ${range === r ? "bg-opacity-70" : "bg-opacity-30"}`}
              onClick={() => {
                setRange(r);
                setHover(null);
              }}
              aria-pressed={range === r}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {chart ? (
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 h-44 sm:h-56">
            <div
              className="relative flex-1 touch-none cursor-crosshair"
              onPointerMove={onPointerMove}
              onPointerDown={onPointerMove}
              onPointerLeave={() => setHover(null)}
              role="img"
              aria-label={`BBITS price over ${range}: ${formatPrice(chart.first)} to ${formatPrice(chart.last)} for 1024 BBITS`}
            >
              <svg
                className="absolute inset-0 w-full h-full overflow-visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {chart.ticks.map((tick) => (
                  <line
                    key={tick}
                    x1={0}
                    x2={100}
                    y1={chart.y(tick)}
                    y2={chart.y(tick)}
                    className="stroke-black/10"
                    strokeDasharray="4 4"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                <path d={chart.area} className="fill-black/5" />
                <path
                  d={chart.line}
                  fill="none"
                  className="stroke-black"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              {active && (
                <>
                  <div
                    className="absolute top-0 bottom-0 w-px bg-black/30 pointer-events-none"
                    style={{ left: `${chart.x(active[0])}%` }}
                  />
                  <div
                    className="absolute w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-full bg-black ring-2 ring-[#DDF5DD] pointer-events-none"
                    style={{
                      left: `${chart.x(active[0])}%`,
                      top: `${chart.y(active[1])}%`,
                    }}
                  />
                </>
              )}
            </div>
            <div className="relative w-14 text-xs text-gray-500 tabular-nums">
              {chart.ticks.map((tick) => (
                <div
                  key={tick}
                  className="absolute right-0 -translate-y-1/2"
                  style={{ top: `${chart.y(tick)}%` }}
                >
                  {tick.toFixed(5)}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mr-16">
            <span>{formatDate(chart.points[0][0])}</span>
            <span>{formatDate(chart.points.at(-1)![0])}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[196px] sm:h-[244px] rounded-lg bg-[#ABBEAC] bg-opacity-20 text-gray-600">
          Price history is unavailable right now
        </div>
      )}
    </div>
  );
};
