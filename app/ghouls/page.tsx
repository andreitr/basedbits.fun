"use server";

import { GhoulsMint } from "@/app/ghouls/components/GhoulsMint";
import { GhoulsNFTList } from "@/app/ghouls/components/GhoulsNFTList";
import { GhoulsStats } from "@/app/ghouls/components/GhoulsStats";
import { GhoulsTreasury } from "@/app/ghouls/components/GhoulsTreasury";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";

// Unlisted test page for the Test Ghouls contract: nothing links here and it is kept out of search indexes
export async function generateMetadata() {
  const title = "Test Ghouls";
  const description =
    "Mint Test Ghouls, track the treasury, and burn them for their share of ETH.";

  return {
    title: title,
    description: description,
    robots: { index: false, follow: false },
  };
}

export default async function Page() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-0 lg:px-10 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-4">
            <GhoulsMint />

            <div className="mt-4 flex flex-col gap-4 px-4 sm:px-0">
              <GhoulsStats />
            </div>

            <div className="mt-6 flex flex-col gap-4 px-4 sm:px-0">
              <GhoulsTreasury />
            </div>

            <div className="mt-6 mb-12 flex flex-col gap-4 px-4 sm:px-0">
              <GhoulsNFTList />
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
