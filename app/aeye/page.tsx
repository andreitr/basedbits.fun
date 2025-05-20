"use server";

import { MintComponent } from "@/app/aeye/components/MintComponent";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { getAeyeById } from "../lib/api/aeye/getAeyeById";
import { getCurrentMint } from "../lib/api/aeye/getCurrentMint";

export async function generateMetadata() {
  const title = "AEYE";
  const description = "AEYE records the rise of artificial intelligence by minting a single daily NFT—each one a dispatch revealing the steady growth of machine consciousness.";

  return {
    title: title,
    description: description,
  };
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
          </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
