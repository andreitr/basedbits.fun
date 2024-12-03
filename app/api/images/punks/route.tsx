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
              <path d="M6 9H22V8H17V5H16V4H15V3H7V4H6V9Z" fill="#303135" />
              <path d="M13 5H15V7H13V5Z" fill="#52535A" />
              <path d="M10 18V19H9V17H16V18H10Z" fill="#3B7AFF" />
              <path d="M10 19H16V20H10V19Z" fill="#3B7AFF" />
              <path d="M10 18H11V19H10V18Z" fill="#CEDFFB" />
              <path d="M12 18H13V19H12V18Z" fill="#CEDFFB" />
              <path d="M14 18H15V19H14V18Z" fill="#CEDFFB" />
              <path d="M11 18H12V19H11V18Z" fill="#303135" />
              <path d="M13 18H14V19H13V18Z" fill="#303135" />
              <path d="M15 18H16V19H15V18Z" fill="#303135" />
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
