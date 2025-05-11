import { ImageResponse } from "next/og";
import { supabase } from "@/app/lib/supabase/client";
import { DBZeitgeist } from "@/app/lib/types/types";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    // Extract ID from URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      throw new Error("ID parameter is required");
    }

    // Get the zeitgeist entry by ID
    const { data, error } = await supabase
      .from("zeitgeist")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new Error("Failed to fetch zeitgeist entry");
    }

    const zeitgeist = data as DBZeitgeist;
    const { headline, lede, emotion, created_at } = zeitgeist;

    const date = new Date(created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",

            justifyContent: "center",
            backgroundColor: "#000000",
          }}
        >
          <div tw="flex flex-col justify-between w-[400px] h-[400px] bg-black text-[#2CB57F] p-10">
            <div tw="h-[300px] flex flex-col justify-center">
              <div tw="text-2xl font-bold mb-5">{headline}</div>
              <div tw="text-1xl" >{lede.replace(/\.$/, '')}</div>
            </div>
            <div tw="text-sm uppercase">{`${emotion} ${date}`}</div>
          </div>
        </div>
      ),
      {
        width: 400,
        height: 400,
        headers: {
          "cache-control": "max-age=600",
          "content-type": "image/png",
        },
      },
    );
  } catch (e: any) {
    console.error("Error generating image:", e);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
