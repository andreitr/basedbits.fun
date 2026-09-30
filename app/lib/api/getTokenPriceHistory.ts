// BBITS / WETH 0.3% on Uniswap v3: the pool the exchange-rate quote reads from
const POOL = "0xc229495845bbb34997e2143799856af61448582f";
const OHLCV_URL = `https://api.geckoterminal.com/api/v2/networks/base/pools/${POOL}/ohlcv`;

// [unix seconds, ETH for 1024 BBITS]
export type PricePoint = [number, number];

export interface TokenPriceHistory {
  // 4-hour closes over the last 30 days, fine enough for the 7D and 30D views
  hourly: PricePoint[];
  // Daily closes over the last year for the longer views
  daily: PricePoint[];
}

const fetchCloses = async (path: string): Promise<PricePoint[]> => {
  // currency=token prices BBITS in WETH rather than USD, matching the exchange rate shown on the page
  const res = await fetch(`${OHLCV_URL}/${path}&currency=token`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`GeckoTerminal ${res.status}`);

  const json = await res.json();
  const list: number[][] = json?.data?.attributes?.ohlcv_list ?? [];

  // Candles arrive newest first as [time, open, high, low, close, volume]
  return list
    .map(([time, , , , close]) => [time, close * 1024] as PricePoint)
    .reverse();
};

export const getTokenPriceHistory = async (): Promise<TokenPriceHistory> => {
  try {
    const [hourly, daily] = await Promise.all([
      fetchCloses("hour?aggregate=4&limit=180"),
      fetchCloses("day?limit=365"),
    ]);
    return { hourly, daily };
  } catch (error) {
    console.error("Error fetching token price history:", error);
    return { hourly: [], daily: [] };
  }
};
