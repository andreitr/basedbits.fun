"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { potraiderContract } from "@/app/lib/contracts/potraider";
import { MintComponent } from "@/app/raid/components/MintComponent";
import { NFTList } from "@/app/raid/components/NFTList";
import { UserComponent } from "@/app/raid/components/UserComponent";
import { formatUnits } from "ethers";

export async function generateMetadata() {
  const contract = potraiderContract();
  const jackpot = await contract.getLotteryJackpot();
  const jackpotFormatted = Number(formatUnits(jackpot, 6)).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );

  const title = "Pot Raiders";
  const description = `For a full year, Pot Raiders will spend a share of the treasury on Megapot tickets. Current jackpot: $${jackpotFormatted}`;
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
  const contract = potraiderContract();

  const [jackpot, currentDay] = await Promise.all([
    contract.getLotteryJackpot(),
    contract.currentLotteryDay(),
  ]);

  const history = await contract.lotteryPurchaseHistory(
    currentDay > 0 ? Number(currentDay) - 1 : 0,
  );

  return (
    <div className="flex flex-col justify-center items-ce ter w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-0 lg:px-10 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-4">
            <MintComponent jackpot={jackpot} history={history} />

            <div className="mt-2 mb-12 flex flex-col gap-4 px-4 sm:px-0">
              <UserComponent />
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
