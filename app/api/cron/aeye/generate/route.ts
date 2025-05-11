import { supabase } from "@/app/lib/supabase/client";
import { NextRequest } from "next/server";
import { DBZeitgeist } from "@/app/lib/types/types";
import { OpenAI } from "openai";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROMPT = `
  Apply a flat, square CRT monitor effect to this image:
  - Render all text in pixelated monospaced font reminiscent of classic CRT terminals.
  - Maintain brightness levels of text exactly: header at full (100%), body text at ~70%, footer at ~30%.
  - Overlay heavier horizontal green scan-lines and intermittent CRT screen-tearing artifacts.
  - Introduce stronger pixel flicker, amplified analog noise, and frequent horizontal jitter lines.
  - Add a soft, luminous green glow halo around each character and intensified RGB channel separation/ghosting.
  - Do not add any curvature—keep the display perfectly flat.
`.trim();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: NextRequest) {
    try {
        // Get the latest zeitgeist entry that needs generation
        const { data, error } = await supabase
            .from("zeitgeist")
            .select("*")
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

        // Generate image template URL
        const imageUrl = `${process.env.NEXT_PUBLIC_URL}/api/images/aeye/template?id=${latestZeitgeist.id}`;

        // 2. Fetch the template image as a Buffer
        const templateResponse = await fetch(imageUrl);
        if (!templateResponse.ok) {
            throw new Error(`Failed to fetch template image: ${templateResponse.statusText}`);
        }
        const arrayBuffer = await templateResponse.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        const imageFile = new File([imageBuffer], 'template.png', { type: 'image/png' });

        const editResponse = await openai.images.edit({
            model: "gpt-image-1",
            image: imageFile,
            prompt: PROMPT,
            n: 1,
            size: "1024x1024",
        });

        if (!editResponse.data?.[0]?.b64_json) {
            throw new Error('No base64 image data in response');
        }

        const imageBase64 = editResponse.data[0].b64_json;

        return new Response(JSON.stringify({
            imageData: `data:image/png;base64,${imageBase64}`
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in generation:", error);
        return new Response("Error in generation", { status: 500 });
    }
}
