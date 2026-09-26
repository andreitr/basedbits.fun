import {
  megapotFetch,
  MegapotPage,
  MegapotTicket,
} from "@/app/lib/api/megapot";
import { LUCKY_GHOULS_ADDRESS } from "@/app/lib/contracts/luckyghouls";

// Megapot tickets owned by the Lucky Ghouls treasury, for one drawing (?round=) or all of them
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const round = searchParams.get("round");
  const cursor = searchParams.get("cursor");

  if (round !== null && !/^\d+$/.test(round)) {
    return Response.json({ error: "Invalid round" }, { status: 400 });
  }

  const params = new URLSearchParams({ limit: "100" });
  if (cursor) params.set("cursor", cursor);

  const path = round
    ? `/wallets/${LUCKY_GHOULS_ADDRESS}/tickets/rounds/${round}`
    : `/wallets/${LUCKY_GHOULS_ADDRESS}/tickets`;

  try {
    const page = await megapotFetch<MegapotPage<MegapotTicket>>(
      `${path}?${params}`,
    );
    return Response.json(page);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unable to load tickets" }, { status: 502 });
  }
}
