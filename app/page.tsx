"use server";

import { Header } from "@/app/lib/components/client/Header";
import { CheckInComponent } from "@/app/lib/components/CheckInComponent";
import { Footer } from "@/app/lib/components/Footer";
import { Social } from "@/app/lib/components/Social";
import { FeatureCard } from "@/app/lib/components/FeatureCard";

import chatBubble from "@/app/lib/icons/social.svg";
import { MintComponent } from "@/app/punks/components/MintComponent";

export default async function Home() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <CheckInComponent />
        </div>
      </div>

      <div className="flex justify-center items-center text-white bg-black w-full lg:px-0 sm:pb-0">
        <div className="container max-w-screen-lg">
          <div className="flex md:flex-row flex-col md:py-2 py-4 px-10 md:px-0 justify-between items-center w-full gap-4">
            <FeatureCard
              title="Burned Bits"
              description="Minting now"
              image={"/images/burnedbit.svg"}
              link="/burn"
            />
            <FeatureCard
              title="Punkalot"
              description="Sold out"
              image={"/images/punkalot.svg"}
              style={"rounded-lg"}
              link="/punks"
            />
            <FeatureCard
              title="Earn tokens"
              description="Share → Earn"
              image={chatBubble}
              style={"bg-[#DDF5DD] w-[80px] h-[80px] rounded-lg"}
              link="/earn"
            />
            <FeatureCard
              title="Swap tokens"
              description="NFTs → BBITS"
              image="/images/icon.png"
              link="/token"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full pt-10 px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg mb-10">
          <MintComponent />
        </div>
      </div>

      <div className="flex justify-center items-center w-full bg-[#859985] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Social />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
