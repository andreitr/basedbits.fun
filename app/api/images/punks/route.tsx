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
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="24" height="24" fill="#DBAEB4" />
              <path d="M7 15V24H10V21H16V6H7V12H6V15H7Z" fill="#53A3FC" />
              <path d="M6 15H7V24H6V15Z" fill="#3B7AFF" />
              <path d="M5 12H6V15H5V12Z" fill="#3B7AFF" />
              <path d="M6 6H7V12H6V6Z" fill="#3B7AFF" />
              <path d="M7 5H16V6H7V5Z" fill="#3B7AFF" />
              <path d="M16 6H17V21H16V6Z" fill="#3B7AFF" />
              <path d="M9 21H16V22H9V21Z" fill="#3B7AFF" />
              <path d="M8 20H9V21H8V20Z" fill="#3B7AFF" />
              <path d="M10 22H11V24H10V22Z" fill="#3B7AFF" />
              <path d="M12 15H15V16H12V15Z" fill="#3B7AFF" />
              <path d="M7 7H8V9H7V7Z" fill="#82BCFC" />
              <path d="M8 6H9V7H8V6Z" fill="#82BCFC" />
              <path d="M2 10H3V11H2V10Z" fill="#CEDFFB" />
              <path d="M4 2H5V3H4V2Z" fill="#CEDFFB" />
              <path d="M20 2H21V3H20V2Z" fill="#CEDFFB" />
              <path d="M19 8H20V9H19V8Z" fill="#CEDFFB" />
              <path d="M18 10H19V11H18V10Z" fill="#CEDFFB" />
              <path
                d="M5 17H6V15H7V11H8V9H10V8H15V9H17V10H18V8H19V7H20V5H19V4H20V3H18V4H17V3H16V1H15V2H14V1H13V2H12V3H11V2H9V1H8V2H6V3H5V4H4V5H3V7H2V8H3V10H4V12H3V14H4V15H5V17Z"
                fill="#CEDFFB"
              />
              <path d="M9 19H10V18H16V17H9V19Z" fill="#3B7AFF" />
              <path d="M10 19H16V20H10V19Z" fill="#3B7AFF" />
              <path d="M10 18H16V19H10V18Z" fill="#CEDFFB" />
              <path d="M9 12V11H11V10H12V12H9Z" fill="#3B7AFF" />
              <path d="M17 12H14V10H15V11H17V12Z" fill="#3B7AFF" />
              <path d="M8 12H9V14H8V12Z" fill="#3B7AFF" />
              <path d="M9 12H10V14H9V12Z" fill="#303135" />
              <path d="M10 12H12V14H10V12Z" fill="#CEDFFB" />
              <path d="M15 12H17V14H15V12Z" fill="#CEDFFB" />
              <path d="M14 12H15V14H14V12Z" fill="#303135" />
              <path d="M17 12H18V14H17V12Z" fill="#3B7AFF" />
            </svg>

            <div tw="flex flex-col items-center justify-center w-[570px]">
              <div tw="text-7xl font-bold p-4 text-[#DBAEB4]">Punkalot</div>
              <div tw="text-3xl font-bold mb-20 text-[#53A3FC]">
                Mint Once - Remix Forever!
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
