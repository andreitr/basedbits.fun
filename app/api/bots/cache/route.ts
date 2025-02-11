import { NextRequest } from "next/server";
import { getAddress } from "ethers";
import { getRecentCheckIns } from "@/app/lib/api/getRecentCheckIns";
import { revalidateTag } from "next/cache";
import { getCheckin } from "@/app/lib/api/getCheckin";
import { getNFTsForOwner } from "@/app/lib/api/getNFTsForOwner";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    revalidateTag("checkins");
    const checkins = await getRecentCheckIns(600);

    checkins.map(async (checkin, index) => {
      const address = getAddress(checkin);

      revalidateTag(`checkIns-${address}`);
      revalidateTag(`getNFTsForOwner-${address}`);

      // Hydrate cache for user checkins and NFTs
      await getCheckin(address);
      await getNFTsForOwner({
        address: address,
        contract: [
          process.env.NEXT_PUBLIC_BB_NFT_ADDRESS,
          process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS,
          process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS,
        ].toString(),
      });

      console.log(`Hydrated cache for: ${address}`);
    });

    return new Response("User Cache revalidated", {
      status: 200,
    });
  } catch (error) {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
