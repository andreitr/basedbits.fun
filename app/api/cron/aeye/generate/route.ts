import { supabase } from "@/app/lib/supabase/client";
import { DBZeitgeist } from "@/app/lib/types/types";
import pinataSDK from "@pinata/sdk";
import { NextRequest } from "next/server";
import { OpenAI } from "openai";
import { Readable } from "stream";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROMPT = `
  Render the text in pixelated monospaced font, simulating a classic flat CRT monitor display:
  - Text color must be exactly #62CDA7 without any variation.
  - Maintain the aspect ratio of the original image.
  - Overlay horizontal green scan lines with 80% opacity and consistent 3-pixel spacing.
  - Apply mild static noise and subtle horizontal jitter lines at 50% opacity.
  - Add a soft, consistent green glow halo around each character with a 5-pixel radius.
  - Introduce mild RGB channel separation (2-pixel offset).
  - No screen curvature—keep the display perfectly flat.
`.trim();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


const pinata = new pinataSDK(
    process.env.PINATA_API_KEY as string,
    process.env.PINATA_SECRET_API_KEY as string
);


export async function GET(req: NextRequest) {
    try {
        // Get the latest zeitgeist entry that needs generation
        const { data, error } = await supabase
            .from("zeitgeist")
            .select("*")
            .is("image", null)
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

        // Pin the generated image to IPFS via Pinata
        const ipfsImageBuffer = Buffer.from(imageBase64, "base64");
        const bufferStream = new Readable();
        bufferStream.push(ipfsImageBuffer);
        bufferStream.push(null);

        try {
            const pinataResult = await pinata.pinFileToIPFS(bufferStream, {
                pinataMetadata: {
                    name: `test-aeye-${latestZeitgeist.id}.png`
                }
            });

            if (!pinataResult.IpfsHash) {
                throw new Error('Failed to get IPFS hash from Pinata response');
            }

            const ipfsHash = pinataResult.IpfsHash;

            // Construct the gateway URL for the pinned content
            const imagePath = `https://${process.env.PINATA_GATEWAY!}/ipfs/${ipfsHash}`;

            // Update the zeitgeist row with the image path
            const { error: updateError } = await supabase
                .from("zeitgeist")
                .update({ image: imagePath })
                .eq("id", latestZeitgeist.id);

            if (updateError) {
                console.error("Error updating zeitgeist row:", updateError);
                return new Response("Error updating zeitgeist row", { status: 500 });
            }

            return new Response(imagePath, { status: 200 });
        } catch (error) {
            console.error("Error in Pinata pinning:", error);
            return new Response("Error in Pinata pinning", { status: 500 });
        }
    } catch (error) {
        console.error("Error in generation:", error);
        return new Response("Error in generation", { status: 500 });
    }
}
