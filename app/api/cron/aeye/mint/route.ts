import { aeyeContract } from "@/app/lib/contracts/aeye";
import { supabase } from "@/app/lib/supabase/client";
import { DBAeye } from "@/app/lib/types/types";
import { postToFarcaster } from "@/app/lib/external/farcaster";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get the latest aeye entry
    const { data, error } = await supabase
      .from("aeye")
      .select("*")
      .eq("state", "generated")
      .not("headline", "is", null)
      .not("image", "is", null)
      .not("lede", "is", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching aeye:", error);
      return new Response("Error fetching latest aeye entry", {
        status: 500,
      });
    }

    if (!data || data.length === 0) {
      return new Response("No aeye entries found with 'generated' state", {
        status: 404,
      });
    }

    const latestAeye = data[0] as DBAeye;

    // Check if this row has already been minted
    if (latestAeye.state === "minted") {
      return new Response("Row already minted", { status: 200 });
    }

    const { headline, lede, emotion, signal, image } = latestAeye;

    if (!headline || !lede || !image) {
      return new Response(
        "Invalid aeye data: missing headline, lede, emotion, signal, or image",
        { status: 400 },
      );
    }

    const contract = aeyeContract();
    const currentMint = await contract.currentMint();
    const dispatch = Number(currentMint.toString()) + 1;

    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Create metadata
    const metadata = JSON.stringify({
      name: date,
      description: lede,
      image: image,
      attributes: [
        {
          trait_type: "headline",
          value: headline,
        },
        {
          trait_type: "lede",
          value: lede,
        },
        {
          trait_type: "emotion",
          value: emotion,
        },
        {
          trait_type: "signal",
          value: signal,
        },
        {
          trait_type: "dispatch",
          value: dispatch,
        },
      ],
    });

    // Mint token
    const tx = await contract.createToken(metadata);
    await tx.wait();

    try {
      await supabase
        .from("aeye")
        .update({
          token: dispatch,
          state: "minted",
        })
        .eq("id", latestAeye.id);
    } catch (error) {
      console.error("Error updating db token:", error);
    }

    const message = `${date} AEYE dispatch is now minting https://www.basedbits.fun/aeye`;
    await postToFarcaster(message, undefined, image);

    return new Response("Success", {
      status: 200,
    });
  } catch (error) {
    console.error("Error minting aeye token:", error);
    return new Response(`Error: Failed to mint token: ${error}`, {
      status: 500,
    });
  }
}
