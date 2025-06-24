"use server";

import { MintComponent } from "@/app/potraider/components/MintComponent";
import NFTList from "@/app/potraider/components/NFTList";
import { UserComponent } from "@/app/potraider/components/UserComponent";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";

export async function generateMetadata() {
  
  const title = "PotRaider: Genesis";
  const description =
    "Daily PotRaider NFTs. Minting now on BASE";

  return {
    title: title,
    description: description,
    other: {
      ["fc:frame"]: "vNext",
      ["fc:frame:image"]: 'images/punkalot.png',
      ["fc:frame:button:1"]: "View",
      ["fc:frame:button:1:action"]: "link",
      ["fc:frame:button:1:target"]: `${process.env.NEXT_PUBLIC_URL}/potraider`,
    },
    openGraph: {
      images: [
        {
          url: 'images/punkalot.png',
          width: 630,
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
  // For now, we'll create a simple structure without the database integration
  // This can be enhanced later with actual PotRaider data

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-0 lg:px-10 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-4">
            <MintComponent />
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="order-2 sm:order-1 font-bold uppercase">
                Minted PotRaiders
              </div>
              <div className="order-1 sm:order-2">
                <UserComponent />
              </div>
            </div>
            <div className="mb-12">
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