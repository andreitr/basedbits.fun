"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { RaffleComponent } from "@/app/raffle/components/RaffleComponent";
import { getRaffleById } from "@/app/lib/api/getRaffleById";
import { revalidatePath } from "next/cache";
import { getCurrentRaffleId } from "@/app/lib/api/getCurrentRaffleId";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { getNFTMetadata } from "@/app/lib/api/getNFTMetadata";
import { truncateAddress } from "@/app/lib/utils/addressUtils";
import { ALCHEMY_API_PATH } from "@/app/lib/constants";

export async function generateMetadata() {
  const raffleId = await getCurrentRaffleId();
  const raffle = await getRaffleById(raffleId);
  const token: AlchemyToken = await getNFTMetadata({
    contract: process.env.NEXT_PUBLIC_BB_NFT_ADDRESS as string,
    path: ALCHEMY_API_PATH.MAINNET,
    tokenId: raffle.sponsor.tokenId.toString(),
    tokenType: "ERC721",
    refreshCache: false,
  });

  const title = raffle.settledAt ? `Raffle #${raffleId}` : `Raffle is Live!`;
  let description = raffle.settledAt
    ? `${token.name} won by ${truncateAddress(raffle.winner)}`
    : `${token.name} is up for grabs!`;

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

export default async function Page() {
  const raffleId = await getCurrentRaffleId();
  const raffle = await getRaffleById(raffleId);

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <RaffleComponent
            id={raffleId}
            raffle={raffle}
            revalidate={async () => {
              "use server";
              revalidatePath(`/raffle/${raffleId}`, "page");
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
