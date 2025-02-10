import { ImageResponse } from "next/og";
import { getNFTsForAddress } from "@/app/lib/api/getNFTsForAddress";
import { getUserTokenBalance } from "@/app/lib/api/getUserTokenBalance";
import { humanizeNumber, streakToDiscount } from "@/app/lib/utils/numberUtils";
import { formatUnits } from "ethers";
import { getCheckin } from "@/app/lib/api/getCheckin";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const address = searchParams?.get("address");

    if (!address) {
      // TODO Gracefully handle this error
      return new Response(`Address is required`, {});
    }

    const lastCheckin = await getCheckin(address);
    const contractNFTs = await getNFTsForAddress({ address, size: 1 });
    const token = contractNFTs.ownedNfts[0];
    const balance = await getUserTokenBalance(address as `0x${string}`);

    const streak = `${lastCheckin.streak}-DAY STREAK 🔥`;
    const total = `${lastCheckin.count} total check-in${lastCheckin.count === 1 ? "" : "s"}`;
    const nfts = `${contractNFTs.totalCount} Based Bits NFTs`;
    const tokens = `${humanizeNumber(Math.round(Number(formatUnits(balance))))} BBITS Tokens`;
    const discount = `Mint discount ${streakToDiscount(lastCheckin.streak)}% OFF`;

    const preview = token.image.originalUrl;

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
                tw="my-[75px] ml-[45px]"
                src={preview}
                width={500}
                height={500}
              />
            )}
            <div tw="flex flex-col items-center justify-center w-[655px]">
              <div tw="text-6xl font-bold p-4 text-[#363E36]">{streak}</div>
              <div tw="text-5xl font-bold mb-20 text-[#677467]">{total}</div>
              <div tw="flex flex-col mx-6 px-10 text-[#677467] text-4xl">
                <div tw="flex mt-4 mb-6">{discount}</div>
                <div tw="flex">{nfts}</div>
                <div tw="flex">{tokens}</div>
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
