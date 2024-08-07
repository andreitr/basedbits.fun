import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const titleA = searchParams?.get("titleA");
    const titleB = searchParams?.get("titleB");
    const description = searchParams?.get("description");
    const preview = searchParams?.get("preview");

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
          <div tw="flex flex-row justify-between">
            {preview && (
              <img
                tw="my-[40px] ml-[40px]"
                src={preview}
                width={550}
                height={550}
              />
            )}
            <div tw="flex flex-col items-center justify-center border w-[610px]">
              <div tw="text-5xl font-bold p-4 text-[#363E36]">{titleA}</div>
              <div tw="text-4xl font-bold mb-10 text-[#677467]">{titleB}</div>
              <div tw="mx-6 px-10 text-center text-[#363E36] text-3xl font-normal">
                {description}
              </div>
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
      },
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
