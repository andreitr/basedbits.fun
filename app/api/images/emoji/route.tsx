import { ImageResponse } from "next/og";
import { getEmojiCurrentMint } from "@/app/lib/api/getEmojiCurrentMint";
import { getEmojiMintById } from "@/app/lib/api/getEmojiMintById";
import { getEmojiCurrentRaffleAmount } from "@/app/lib/api/getEmojiCurrentRaffleAmount";
import { getNFTRawMetadata } from "@/app/lib/api/getNFTRawMetadata";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id: any = searchParams?.get("id");

    if (!id) {
      id = await getEmojiCurrentMint();
    }

    const mint = await getEmojiMintById({ id: Number(id) });
    const meta = await getNFTRawMetadata({
      abi: EmojiBitsABI,
      address: "0xf6b0da3a3a8e23bbc7df54fe42bee302e35ea8dc",
      id: id,
    });

    const isMintLive = !mint.settledAt;
    let reward = "0";
    if (isMintLive) {
      reward = await getEmojiCurrentRaffleAmount();
    }

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

            <div tw="flex absolute bottom-0 left-0 right-0 items-center justify-center m-4 p-6 text-center text-4xl text-white bg-black bg-opacity-60 rounded-xl">
              {isMintLive ? (
                <>{`${meta.name} - ${reward.toString()} Mint Reward`}</>
              ) : (
                <>{`${meta.name} - Mint Ended`}</>
              )}
            </div>
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
