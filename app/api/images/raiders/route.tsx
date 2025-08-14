import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
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
            backgroundColor: "#000000",
          }}
        >
          <div tw="flex flex-row justify-between h-[630px] w-[1200px]">
            <div tw="flex flex-col justify-center w-[680px] pl-30">
              <div tw="text-8xl mb-6 mt-11 font-bold text-[#FEC94F]">
                Pot Raiders
              </div>
              <div tw="text-4xl text-[#B9B9B9]">
                1K degens raiding Megapot every day for one year.
              </div>
            </div>
            <div tw="flex items-center w-[560px]">
              <img
                src="https://basedbits.fun/images/raider_black.svg"
                alt="Pot Raider"
                tw="w-[500px] h-[500px]"
              />
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
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
          "cache-control": "max-age=600",
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
