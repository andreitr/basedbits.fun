import { revalidateTag } from "next/cache";
import { getCheckin } from "@/app/lib/api/getCheckin";
import { getNFTsForOwner } from "@/app/lib/api/getNFTsForOwner";
import { isAddress } from "viem";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams?.get("address");

  if (!address || !isAddress(address)) {
    return new Response("Invalid address", {
      status: 400,
    });
  }

  try {
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

    return new Response("User cache hydrated", {
      status: 200,
    });
  } catch (error) {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
