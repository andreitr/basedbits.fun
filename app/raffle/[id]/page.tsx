"use server";

import {Header} from "@/app/lib/components/Header";
import {Footer} from "@/app/lib/components/Footer";
import {RaffleComponent} from "@/app/raffle/[id]/components/RaffleComponent";
import {getRaffleById} from "@/app/lib/api/getRaffleById";
import {revalidatePath} from "next/cache";

interface PageProps {
  params: {
    id: number;
  };
}

export async function generateMetadata({ params: { id } }: PageProps) {
  const raffle = await getRaffleById(id);
  const title = `Raffle for Based Bit #${raffle.sponsor.tokenId}`;
  let description = `Raffle for Based Bit #${raffle.sponsor.tokenId}! A Based Bit is raffled off every 24 hours. Check-in to enter for free.`;

  const preview = `https://ipfs.raribleuserdata.com/ipfs/QmRqqnZsbMLJGWt8SWjP2ebtzeHtWv5kkz3brbLzY1ShHt/${raffle.sponsor.tokenId}.png`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [
        {
          url: preview,
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
