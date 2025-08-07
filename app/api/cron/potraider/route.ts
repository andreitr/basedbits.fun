import { potraiderContract } from "@/app/lib/contracts/potraider";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const contract = potraiderContract();

    // Mint token
    const tx = await contract.purchaseLotteryTicket();
    await tx.wait();

    return new Response("Success", {
      status: 200,
    });
  } catch (error) {
    console.error("Error purchasing potraider ticket:", error);
    return new Response(
      `Error: Failed to purchase potraider ticket: ${error}`,
      {
        status: 500,
      },
    );
  }
}
