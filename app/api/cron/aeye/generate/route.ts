import { supabase } from "@/app/lib/supabase/client";
import { DBAeye } from "@/app/lib/types/types";
import pinataSDK from "@pinata/sdk";
import { NextRequest } from "next/server";
import { OpenAI } from "openai";
import { Readable } from "stream";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROMPT = `
  Apply a flat, square CRT monitor effect to this image:
  - Maintain aspect ratio of the original image.
  - Render all text in pixelated monospaced font reminiscent of classic CRT terminals.
  - Use #62CDA7 for the text color.
  - Overlay heavier horizontal green scan-lines and intermittent CRT screen-tearing artifacts.
  - Introduce stronger pixel flicker, amplified analog noise, and frequent horizontal jitter lines.
  - Add a soft, luminous green glow halo around each character and intensified RGB channel separation/ghosting.
  - Do not add any curvature—keep the display perfectly flat.
`.trim();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY as string,
  process.env.PINATA_SECRET_API_KEY as string,
);

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get the latest aeye entry that needs generation
    const { data, error } = await supabase
      .from("aeye")
      .select("*")
      .eq("state", "composed")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching aeye:", error);
      return new Response("Error fetching latest aeye entry", {
        status: 500,
      });
    }

    if (!data || data.length === 0) {
      return new Response("No aeye entries found with 'composed' state", {
        status: 404,
      });
    }

    const latestAeye = data[0] as DBAeye;

    // Check if this row has already been generated
    if (latestAeye.state === "generated") {
      return new Response("Row already generated", { status: 200 });
    }

    // Generate image template URL
    const imageUrl = `${process.env.NEXT_PUBLIC_URL}/api/images/aeye/template?id=${latestAeye.id}`;

    const templateResponse = await fetch(imageUrl);
    if (!templateResponse.ok) {
      throw new Error(
        `Failed to fetch template image: ${templateResponse.statusText}`,
      );
    }
    const arrayBuffer = await templateResponse.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const imageFile = new File([imageBuffer], "template.png", {
      type: "image/png",
    });

    const editResponse = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt: PROMPT,
      n: 1,
      size: "1024x1024",
    });

    if (!editResponse.data?.[0]?.b64_json) {
      throw new Error("No base64 image data in response");
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
          name: `test-aeye-${latestAeye.id}.png`,
        },
      });

      if (!pinataResult.IpfsHash) {
        throw new Error("Failed to get IPFS hash from Pinata response");
      }

      const ipfsHash = pinataResult.IpfsHash;

      // Construct the gateway URL for the pinned content
      const imagePath = `https://${process.env.PINATA_GATEWAY!}/ipfs/${ipfsHash}`;

      // Update the aeye row with the image path
      const { error: updateError } = await supabase
        .from("aeye")
        .update({
          image: imagePath,
          state: "generated",
        })
        .eq("id", latestAeye.id);

      if (updateError) {
        console.error("Error updating aeye row:", updateError);
        return new Response("Error updating aeye row", { status: 500 });
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
