"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { potraiderContract } from "@/app/lib/contracts/potraider";
import { MintComponent } from "@/app/potraider/components/MintComponent";
import { NFTList } from "@/app/potraider/components/NFTList";
import { UserComponent } from "@/app/potraider/components/UserComponent";

export async function generateMetadata() {
  const title = "Pot Raiders";
  const description = "Daily PotRaider NFTs. Minting now on BASE";
  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/raiders`;

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

  const history = await contract.lotteryPurchaseHistory(Number(currentDay) - 1);

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
