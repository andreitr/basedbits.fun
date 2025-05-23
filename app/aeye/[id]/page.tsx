"use server";

import { MintComponent } from "@/app/aeye/components/MintComponent";
import { getAeyeById } from "@/app/lib/api/aeye/getAeyeById";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import {
  AeyeTokenMetadata,
  getTokenMetadata,
} from "../../lib/api/aeye/getTokenMetadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aeye = await getAeyeById(parseInt(id));

  return {
    title: aeye?.headline,
    description: aeye?.lede,
    openGraph: {
      images: [
        {
          url: aeye?.image,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: aeye?.headline,
      description: aeye?.lede,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aeye = await getAeyeById(parseInt(id));

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <MintComponent token={aeye || undefined} />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
