"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { potraiderContract } from "@/app/lib/contracts/potraider";
import { MintComponent } from "@/app/potraider/components/MintComponent";
import NFTList, { NFTCard } from "@/app/potraider/components/NFTList";
import { formatUnits } from "viem";
import { JsonRpcProvider } from "ethers";

export async function generateMetadata() {
  const title = "PotRaider: Genesis";
  const description = "Daily PotRaider NFTs. Minting now on BASE";

  return {
    title: title,
    description: description,
    other: {
      ["fc:frame"]: "vNext",
      ["fc:frame:image"]: "images/punkalot.png",
      ["fc:frame:button:1"]: "View",
      ["fc:frame:button:1:action"]: "link",
      ["fc:frame:button:1:target"]: `${process.env.NEXT_PUBLIC_URL}/potraider`,
    },
    openGraph: {
      images: [
        {
          url: "images/punkalot.png",
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
  const contract = potraiderContract();

  // Get contract ETH balance
  const provider = new JsonRpcProvider(
    `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
  );
  const contractBalance = await provider.getBalance(
    process.env.NEXT_PUBLIC_RAIDER_ADDRESS as string,
  );

  const [
    circulatingSupply,
    totalSupply,
    jackpot,
    lastJackpotEndTime,
    dailySpent,
    totalDays,
    currentDay,
    redeemValue,
  ] = await Promise.all([
    contract.circulatingSupply(),
    contract.totalSupply(),
    contract.getLotteryJackpot(),
    contract.getLotterylastJackpotEndTime(),
    contract.getDailyPurchaseAmount(),
    contract.lotteryParticipationDays(),
    contract.currentLotteryDay(),
    contract.getRedeemValue(),
  ]);

  return (
    <div className="flex flex-col justify-center items-ce ter w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-0 lg:px-10 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-4">
            <MintComponent
              count={circulatingSupply}
              lastJackpotEndTime={lastJackpotEndTime}
              dailySpent={dailySpent}
              jackpot={jackpot}
              totalDays={totalDays}
              currentDay={currentDay}
              contractBalance={contractBalance}
              redeemValue={redeemValue}
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="order-2 sm:order-1 font-bold uppercase">
                Your PotRaiders
              </div>
            </div>

            <div className="mb-12">
              <NFTList redeemValue={redeemValue} />
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
