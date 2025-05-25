"use server";

import { MintComponent } from "@/app/aeye/components/MintComponent";
import NFTList from "@/app/aeye/components/NFTList";
import { UserComponent } from "@/app/aeye/components/UserComponent";
import { getAeye } from "@/app/lib/api/aeye/getAeye";
import { getAeyeById } from "@/app/lib/api/aeye/getAeyeById";
import { getCurrentMint } from "@/app/lib/api/aeye/getCurrentMint";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";

export async function generateMetadata() {
  const currentMint = await getCurrentMint();

  const aeye = await getAeyeById(currentMint);
  const title = "AEYE Genesis";
  const description =
    "AEYE records the rise of artificial intelligence by minting a single daily NFT—each one a dispatch revealing the steady growth of machine consciousness.";

  return {
    title: title,
    description: description,
    other: {
      ["fc:frame"]: "vNext",
      ["fc:frame:image"]: aeye?.image,
      ["fc:frame:button:1"]: "Mint",
      ["fc:frame:button:1:action"]: "link",
      ["fc:frame:button:1:target"]: `${process.env.NEXT_PUBLIC_URL}/aeye`,

      // ["fc:frame:button:2"]: `Mint`,
      // ["fc:frame:button:2:action"]: "tx",
      // ["fc:frame:button:2:target"]: `${process.env.NEXT_PUBLIC_URL}/api/burn`,
    },
    openGraph: {
      images: [
        {
          url: aeye?.image,
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
  const currentMint = await getCurrentMint();
  const aeye = await getAeyeById(currentMint);
  const list = await getAeye();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-0 lg:px-10 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-4">
            <MintComponent token={aeye || undefined} />
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="order-2 sm:order-1 text-2xl font-bold">Minted Dispatches</div>
              <div className="order-1 sm:order-2"><UserComponent /></div>
            </div>
            <div className="mb-12">
              <NFTList list={list.data} />
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
