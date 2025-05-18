"use server";

import { MintComponent } from "@/app/aeye/components/MintComponent";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { getTokenMetadata } from "../../lib/api/aeye/getTokenMetadata";
import { AeyeTokenMetadata } from "../../lib/api/aeye/getTokenMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  
  const { id } = await params;

  const token: AeyeTokenMetadata = await getTokenMetadata(parseInt(id));

  const title = token.name;
  const description = token.description;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [
        {
          url: token.image,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const token: AeyeTokenMetadata = await getTokenMetadata(parseInt(id));

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <MintComponent token={token} />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
} 