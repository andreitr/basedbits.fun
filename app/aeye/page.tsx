"use server";

import { MintComponent } from "@/app/aeye/components/MintComponent";
import { getAeyeById } from "@/app/lib/api/aeye/getAeyeById";
import { getCurrentMint } from "@/app/lib/api/aeye/getCurrentMint";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { UserComponent } from "./components/UserComponent";

export async function generateMetadata() {

  const currentMint = await getCurrentMint();
  const aeye = await getAeyeById(currentMint);
  const title = "AEYE Genesis";
  const description = "AEYE records the rise of artificial intelligence by minting a single daily NFT—each one a dispatch revealing the steady growth of machine consciousness.";

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
  }
}

export default async function Page() {

  const currentMint = await getCurrentMint();
  const aeye = await getAeyeById(currentMint);

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <div className="w-full bg-yellow-400 text-red-500 text-center py-2 mb-4 font-semibold rounded-lg text-2xl">
            SEPOLIA TEST
          </div>

          <MintComponent token={aeye || undefined}/>
          <UserComponent />
          </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
