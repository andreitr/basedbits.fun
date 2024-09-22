import { ImageResponse } from "next/og";
import { getNFTRawMetadata } from "@/app/lib/api/getNFTRawMetadata";
import { getBit98CurrentMint } from "@/app/lib/api/getBit98CurrentMint";
import { getBit98MintById } from "@/app/lib/api/getBit98MintById";
import { Bit98ABI } from "@/app/lib/abi/Bit98.abi";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id: any = searchParams?.get("id");

    if (!id) {
      id = await getBit98CurrentMint();
    }

    const mint = await getBit98MintById({ id: Number(id) });
    const meta = await getNFTRawMetadata({
      abi: Bit98ABI,
      address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
      id: id,
    });

    const isMintLive = !mint.settledAt;

    const interBoldFont = await fetch(
      new URL("../assets/Inter-Bold.ttf", import.meta.url),
    ).then((res) => res.arrayBuffer());

    const interRegularFont = await fetch(
      new URL("../assets/Inter-Regular.ttf", import.meta.url),
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            fontFamily: '"Inter"',
            justifyContent: "flex-start",
            backgroundColor: "#DDF5DD",
          }}
        >
          <div tw="flex">
            <img src={meta.image} width={840} height={840} />

            {!isMintLive && (
              <div tw="flex absolute bottom-0 left-0 right-0 items-center justify-center m-4 p-6 text-center text-4xl text-white bg-black bg-opacity-60 rounded-xl">
                <>{`${meta.name} - Mint Ended`}</>
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 840,
        height: 840,
        fonts: [
          {
            data: interBoldFont,
            name: "Inter",
            style: "normal",
            weight: 700,
          },
          {
            data: interRegularFont,
            name: "Inter",
            style: "normal",
            weight: 400,
          },
        ],
        headers: {
          "cache-control": "public, immutable, no-transform, max-age=60",
          "content-type": "image/png",
        },
      },
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
