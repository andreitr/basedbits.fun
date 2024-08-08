"use server";

import { Header } from "@/app/lib/components/Header";
import { Footer } from "@/app/lib/components/Footer";
import { MintComponent } from "@/app/emojibits/components/MintComponent";
import type { Mint } from "@/app/lib/types/types";
import BigNumber from "bignumber.js";
import { MintRules } from "@/app/emojibits/components/MintRules";
import { getRaffleById } from "@/app/lib/api/getRaffleById";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { getNFTMetadata } from "@/app/lib/api/getNFTMetadata";
import { truncateAddress } from "@/app/lib/utils/addressUtils";

interface Props {
  params: {
    id: number;
  };
}

export async function generateMetadata({ params: { id } }: Props) {
  const raffle = await getRaffleById(id);
  const token: AlchemyToken = await getNFTMetadata({
    tokenId: raffle.sponsor.tokenId.toString(),
  });

  const title = `Emoji Bit ${id}`;
  let description = raffle.settledAt
    ? `33 editions minted! Raffle won by ${truncateAddress(raffle.winner)}`
    : `33 editions minted so far!`;

  const ogPreviewPath = `/api/images/raffle?title=${encodeURIComponent(title)}&preview=${token.image.originalUrl}&description=${encodeURIComponent(description)}`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [
        {
          url: ogPreviewPath,
          width: 1200,
          height: 1200,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page({ params: { id } }: Props) {
  const fakeMint: Mint = {
    burned: BigNumber(200000000000000000).toString(),
    rewards: BigNumber(2700000000000000000).toString(),
    settledAt: BigNumber(1632559200),
    startedAt: BigNumber(1632559200),
    tokenId: BigNumber(id),
    mints: BigNumber(100),
    winner: "0x1d671d1B191323A38490972D58354971E5c1cd2A",
    entries: [
      {
        user: `0x${"0".repeat(40)}`,
        weight: BigNumber(1),
      },
      {
        user: `0x${"0".repeat(40)}`,
        weight: BigNumber(10),
      },
      {
        user: `0x1d671d1B191323A38490972D58354971E5c1cd2A`,
        weight: BigNumber(8),
      },
    ],
  };

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-6 mb-8">
            <MintComponent id={id} mint={fakeMint} />
            <div>
              A new Emoji Bit is born every 8 hours! Half of mint proceeds are
              raffled; the rest burned via BBITS 🔥
            </div>
            <MintRules />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
