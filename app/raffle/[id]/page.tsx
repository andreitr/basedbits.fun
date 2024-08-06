"use server";

import { Header } from "@/app/lib/components/Header";
import { Footer } from "@/app/lib/components/Footer";
import { RaffleComponent } from "@/app/raffle/[id]/components/RaffleComponent";
import { getRaffleById } from "@/app/lib/api/getRaffleById";
import { revalidatePath } from "next/cache";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { getNFTMetadata } from "@/app/lib/api/getNFTMetadata";
import { truncateAddress } from "@/app/lib/utils/addressUtils";

interface PageProps {
  params: {
    id: number;
  };
}

export async function generateMetadata({ params: { id } }: PageProps) {
  const raffle = await getRaffleById(id);
  const token: AlchemyToken = await getNFTMetadata({
    tokenId: raffle.sponsor.tokenId.toString(),
  });

  const title = raffle.settledAt ? `Raffle #${id}` : `Raffle is Live!`;
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

export default async function Page({ params: { id } }: PageProps) {
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
