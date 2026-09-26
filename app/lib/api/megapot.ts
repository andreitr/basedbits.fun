const MEGAPOT_API_URL = "https://api.megapot.io/v1";

export interface MegapotAmount {
  amount: string;
  decimals: number;
}

export interface MegapotTicket {
  id: string;
  round_id: string;
  normals: number[];
  bonusball: number;
  // null until the drawing settles
  matched_normals: number | null;
  bonusball_match: boolean | null;
  winnings_amount: MegapotAmount | null;
  claimed: boolean;
  tx_hash: string;
  created_at: string;
}

export interface MegapotPage<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface MegapotWalletStats {
  total_tickets: number;
  total_wins: number;
  total_winnings: MegapotAmount;
  total_spent: MegapotAmount;
  rounds_played: number;
}

// Server-side Megapot Data API call; authenticated when MEGAPOT_API_KEY is set, anonymous tier otherwise
export const megapotFetch = async <T>(path: string): Promise<T> => {
  const headers: Record<string, string> = {};
  if (process.env.MEGAPOT_API_KEY) {
    headers.Authorization = `Bearer ${process.env.MEGAPOT_API_KEY}`;
  }

  const response = await fetch(`${MEGAPOT_API_URL}${path}`, {
    headers,
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    throw new Error(`Megapot API ${path} failed: ${response.status}`);
  }
  return (await response.json()) as T;
};
