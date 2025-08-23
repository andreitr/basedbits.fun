"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { Tabs } from "@/app/punks/components/Tabs";
import { MintComponent } from "@/app/punks/components/MintComponent";

export async function generateMetadata() {
  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/punks`;

  const title = "Punkalot";
  const description = "Mint a Punk and make it your own!";

  return {
    title: title,
    description: description,

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
      title: title,
      description,
    },
  };
}

export default async function Page() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <MintComponent />
          <div className="mt-10 mb-10">
            <Tabs />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
