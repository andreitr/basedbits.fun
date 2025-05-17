import { getAEYEContract } from "@/app/lib/contracts/aeye";
import { supabase } from "@/app/lib/supabase/client";
import { DBZeitgeist } from "@/app/lib/types/types";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {


        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Get the latest zeitgeist entry
        const { data, error } = await supabase
            .from("zeitgeist")
            .select("*")
            .is("token", null)
            .not("image", "is", null)
            .not("headline", "is", null)
            .not("lede", "is", null)
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            console.error("Error fetching zeitgeist:", error);
            return new Response("Error fetching latest zeitgeist entry", { status: 500 });
        }

        if (!data || data.length === 0) {
            return new Response("No zeitgeist entries found", { status: 404 });
        }

        const latestZeitgeist = data[0] as DBZeitgeist;
        const { headline, lede, emotion, signal, image } = latestZeitgeist;

        if (!headline || !lede || !image) {
            return new Response("Invalid zeitgeist data: missing headline, lede, emotion, signal, or image", { status: 400 });
        }

        const contract = getAEYEContract();
        const currentMint = await contract.currentMint();
        const dispatch = Number(currentMint.toString()) + 1;

        // Create metadata
        const metadata = JSON.stringify({
            name: `AEYE #${dispatch}`,
            description: lede,
            image: image,
            attributes: [
                {
                    trait_type: "headline",
                    value: headline
                },
                {
                    trait_type: "lede",
                    value: lede
                },
                {
                    trait_type: "emotion",
                    value: emotion
                },
                {
                    trait_type: "signal",
                    value: signal
                },
                {
                    trait_type: "date",
                    value: new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    })
                }
            ]
        });

        // Mint token
        const tx = await contract.createToken(image, metadata);
        await tx.wait();

        try {

            await supabase
                .from("zeitgeist")
                .update({ token: dispatch })
                .eq("id", latestZeitgeist.id);

        } catch (error) {
            console.error("Error updating db token:", error);
        }

        return new Response(`Successfully minted Zeitgeist token for word: ${headline}`, {
            status: 200,
        });
    } catch (error) {
        console.error("Error minting zeitgeist token:", error);
        return new Response(`Error: Failed to mint token: ${error}`, { status: 500 });
    }
}