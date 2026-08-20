"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { MintComponent } from "@/app/raid/components/MintComponent";
import { NFTList } from "@/app/raid/components/NFTList";

export async function generateMetadata() {
  const title = "Pot Raiders";
  const description = "The Pot Raiders raid has ended.";
  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/raid`;

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
    <div className="flex flex-col justify-center items-ce ter w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-0 lg:px-10 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-4">
            <MintComponent />

            <div className="mt-2 mb-12 flex flex-col gap-4 px-4 sm:px-0">
              <NFTList />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
