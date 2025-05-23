"use server";

import { MintComponent } from "@/app/burn/components/MintComponent";
import { CheckInComponent } from "@/app/lib/components/CheckInComponent";
import { CountDown } from "@/app/lib/components/client/CountDown";
import { Header } from "@/app/lib/components/client/Header";
import { UserList } from "@/app/lib/components/client/UserList";
import { ClientWrapper } from "@/app/lib/components/ClientWrapper";
import { FeatureCard } from "@/app/lib/components/FeatureCard";
import { Footer } from "@/app/lib/components/Footer";
import { FeatureBasePaintCard } from "./lib/components/FeatureBasePaintCard";
import Link from "next/link";

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
              title="AEYE Agent"
              description="Coming soon"
              image={"/images/aeye.png"}
              style={"bg-[#0052FF] w-[80px] h-[80px] rounded-lg"}
              link="https://warpcast.com/andreitr.eth/0x9adb8e92"
            />
            <FeatureBasePaintCard
              title="Mint BasePaint"
              description="Burn BBITS"
              link="https://basepaint.xyz/mint?referrer=0xDAdA5bAd8cdcB9e323d0606d081E6Dc5D3a577a1"
              style="rounded-lg"
            />
            <div className="md:hidden w-full">
              <FeatureCard
                title="Airdrop Agent"
                description="Share → BBITS"
                image={"/images/fcairdrop.svg"}
                style={"rounded-lg"}
                link="https://warpcast.com/andreitr.eth/0x2dc108f7"
              />
            </div>
            <FeatureCard
              title="BBITS Token"
              description="NFTs → BBITS"
              image="/images/icon.png"
              link="/token"
            />
          </div>
        </div>
      </div>

      <div className="hidden md:flex justify-center items-center w-full pt-10">
        <div className="container max-w-screen-lg mb-10 bg-white rounded-lg p-4">
          Mint BasePaint using{" "}
          <Link
            href="https://basepaint.xyz/mint?referrer=0xDAdA5bAd8cdcB9e323d0606d081E6Dc5D3a577a1"
            target="_blank"
            className="text-blue-500 underline"
          >
            our link
          </Link>
          , and we will burn the referral fee so your tokens go up!
        </div>
      </div>

      <div className="flex justify-center items-center w-full pb-8 mt-10 md:mt-0">
        <div className="container max-w-screen-lg mb-8">
          <MintComponent />
        </div>
      </div>

      <div className="flex justify-center items-center w-full bg-[#859985] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg mb-10 mt-10">
          <div className="text-5xl font-semibold text-[#080908] mb-4 flex md:flex-row flex-col md:gap-6 md:items-center">
            <div>Airdrop in</div>
            <CountDown hour={7} />
          </div>
          <div>
            The daily allocation of 200 BBITS is evenly distributed among all
            active checked-in wallets.
          </div>
          <div></div>
          <div className="mt-4">
            <ClientWrapper>
              <UserList />
            </ClientWrapper>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
