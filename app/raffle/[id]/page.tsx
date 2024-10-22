"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { RaffleComponent } from "@/app/raffle/components/RaffleComponent";
import { getRaffleById } from "@/app/lib/api/getRaffleById";
import { revalidatePath } from "next/cache";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { getNFTMetadata } from "@/app/lib/api/getNFTMetadata";
import { truncateAddress } from "@/app/lib/utils/addressUtils";
import { ALCHEMY_API_PATH } from "@/app/lib/constants";

interface Props {
  params: {
    id: number;
  };
}

export async function generateMetadata({ params: { id } }: Props) {
  const raffle = await getRaffleById(id);
  const token: AlchemyToken = await getNFTMetadata({
    contract: process.env.NEXT_PUBLIC_BB_NFT_ADDRESS as string,
    path: ALCHEMY_API_PATH.MAINNET,
    tokenId: raffle.sponsor.tokenId.toString(),
    tokenType: "ERC721",
    refreshCache: false,
  });

  const title = raffle.settledAt ? `Raffle #${id}` : `Raffle is Live!`;
  let description = raffle.settledAt
    ? `${token.name} won by ${truncateAddress(raffle.winner)}`
    : `${token.name} is up for grabs!`;

  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/raffle?title=${encodeURIComponent(title)}&preview=${token.image.originalUrl}&description=${encodeURIComponent(description)}`;

  return {
    title: title,
    description: description,
    other: {
      ["fc:frame"]: "vNext",
      ["fc:frame:image"]: ogPreviewPath,
      ["fc:frame:button:1"]: `Visit Raffle #${id}`,
      ["fc:frame:button:1:action"]: "link",
      ["fc:frame:button:1:target"]: `${process.env.NEXT_PUBLIC_URL}/raffle/${id}`,
      ["fc:frame:button:2"]: `Enter Raffle #${id}`,
      ["fc:frame:button:2:action"]: "tx",
      ["fc:frame:button:2:target"]: `${process.env.NEXT_PUBLIC_URL}/api/raffle/${id}`,
    },
    openGraph: {
      images: [
        {
          url: ogPreviewPath,
          width: 1200,
          height: 630,
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
  const raffle = await getRaffleById(id);

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <RaffleComponent
            id={id}
            raffle={raffle}
            revalidate={async () => {
              "use server";
              revalidatePath(`/raffle/${id}`, "page");
            }}
          />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
