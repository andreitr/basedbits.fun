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
          <div tw="flex flex-row justify-between">
            <svg
              width="630"
              height="630"
              viewBox="0 0 27 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="27" height="27" fill="#000066" />
              <path
                d="M9 24V23H8V22H7V21H6V20H5V17H4V14H5V12H6V10H7V9H6V8H7V9H8V11H9V10H10V8H9V5H10V4H11V3H13V2H18V3H15V4H14V7H16V8H18V9H19V12H18V14H19V13H20V12H22V13H21V14H20V15H21V19H20V20H19V22H18V23H16V24H9Z"
                fill="#FF0000"
              />
              <path d="M8 6H7V7H8V6Z" fill="#FF0000" />
              <path d="M19 5V4H20V5H19Z" fill="#FF0000" />
              <path d="M20 9V8H21V9H20Z" fill="#FF0000" />
              <path
                d="M10 23V24H15V23H16V22H17V18H16V16H15V13H13V9H12V11H11V15H10V16H9V17H8V22H9V23H10Z"
                fill="#FFAA00"
              />
              <path d="M14 12V11H15V12H14Z" fill="#FFAA00" />
              <path d="M9 14V13H10V14H9Z" fill="#FFAA00" />
              <path d="M13 8V7H14V8H13Z" fill="#FFAA00" />
              <path d="M15 9V8H16V9H15Z" fill="#FFAA00" />
              <path d="M16 15V14H17V15H16Z" fill="#FFAA00" />
              <path
                d="M12 24V23H11V22H10V20H9V19H10V18H11V15H12V12H13V13H14V16H15V18H16V22H15V23H14V24H12ZM15 20V19H11V20H15Z"
                fill="#FFD84C"
              />
              <path
                d="M7 15V18H13V15H14V18H20V12H14V14H13V12H7V14H4V17H5V15H7Z"
                fill="#0052FF"
              />
              <rect x="10" y="13" width="2" height="4" fill="black" />
              <rect x="17" y="13" width="2" height="4" fill="black" />
              <path d="M10 13H8V17H10V15H11V14H10V13Z" fill="white" />
              <path d="M17 13H15V17H17V15H18V14H17V13Z" fill="white" />
            </svg>

            <div tw="flex flex-col items-center justify-center w-[570px]">
              <div tw="text-7xl font-bold p-4 text-[#FF0000]">Burned Bits</div>
              <div tw="text-5xl font-bold mb-20 text-[#FFD84C]">
                Minting Now
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
