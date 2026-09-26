import { megapotFetch, MegapotWalletStats } from "@/app/lib/api/megapot";
import { LUCKY_GHOULS_ADDRESS } from "@/app/lib/contracts/luckyghouls";

// Lifetime Megapot stats for the Lucky Ghouls treasury
export async function GET() {
  try {
    const stats = await megapotFetch<MegapotWalletStats>(
      `/wallets/${LUCKY_GHOULS_ADDRESS}/stats`,
    );
    return Response.json(stats);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unable to load stats" }, { status: 502 });
  }
}
