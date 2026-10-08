import { megapotFetch, MegapotWalletStats } from "@/app/lib/api/megapot";
import { EVIL_ODDS_ADDRESS } from "@/app/lib/contracts/evilodds";

// Lifetime Megapot stats for the Evil Odds treasury
export async function GET() {
  try {
    const stats = await megapotFetch<MegapotWalletStats>(
      `/wallets/${EVIL_ODDS_ADDRESS}/stats`,
    );
    return Response.json(stats);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unable to load stats" }, { status: 502 });
  }
}
