import { CheckInComponent } from "@/app/lib/components/CheckInComponent";
import { CountDown } from "@/app/lib/components/client/CountDown";
import { Header } from "@/app/lib/components/client/Header";
import { UserList } from "@/app/lib/components/client/UserList";
import { ClientWrapper } from "@/app/lib/components/ClientWrapper";
import { FeatureBasePaintCard } from "@/app/lib/components/FeatureBasePaintCard";
import { FeatureCard } from "@/app/lib/components/FeatureCard";
import { Footer } from "@/app/lib/components/Footer";
import { potraiderContract } from "@/app/lib/contracts/potraider";
import { MintComponent } from "@/app/raid/components/MintComponent";

export default async function Home() {
  const contract = potraiderContract();

  const [jackpot, currentDay] = await Promise.all([
    contract.getLotteryJackpot(),
    contract.currentLotteryDay(),
  ]);

  const history = await contract.lotteryPurchaseHistory(
    currentDay > 0 ? Number(currentDay) - 1 : 0,
  );

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
              title="Pot Raiders"
              description="Minting now"
              image={"/images/raider.svg"}
              link="/raid"
            />
            <FeatureCard
              title="Burned Bits"
              description="Minting now"
              image={"/images/burnedbit.svg"}
              link="/burn"
            />
            <FeatureBasePaintCard
              title="Mint BasePaint"
              description="Burn BBITS"
              link="https://basepaint.xyz/mint?referrer=0xDAdA5bAd8cdcB9e323d0606d081E6Dc5D3a577a1"
              style="rounded-lg"
            />
            <FeatureCard
              title="BBITS Token"
              description="NFTs → BBITS"
              image="/images/icon.png"
              link="/token"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full pt-10 pb-3 mt-10 md:mt-0">
        <div className="container max-w-screen-lg mb-8">
          <MintComponent jackpot={jackpot} history={history} />
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
