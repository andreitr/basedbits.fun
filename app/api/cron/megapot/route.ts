import { megapotContract } from "@/app/lib/contracts/megapot";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const contract = megapotContract();
           
    const tx = await contract.withdrawReferralFees();
    await tx.wait();

    return new Response("Referral fees withdrawn successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error withdrawing referral fees:", error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
