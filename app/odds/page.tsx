import { OddsMint } from "@/app/odds/components/OddsMint";
import { OddsTabs } from "@/app/odds/components/OddsTabs";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { readOddsDrawings } from "@/app/lib/evilodds/readOddsDrawings";

// Static page regenerated in the background; live stats load on the client
export const revalidate = 60;

// Unlisted page for the Evil Odds contract: nothing links here and it is kept out of search indexes
export async function generateMetadata() {
  const title = "Evil Odds";
  const description =
    "Mint Evil Odds, track the treasury, and burn them for their share of ETH.";

  return {
    title: title,
    description: description,
    robots: { index: false, follow: false },
  };
}

export default async function Page() {
  const drawings = await readOddsDrawings().catch((error) => {
    console.error("Failed to prefetch Evil Odds drawings", error);
    return undefined;
  });

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] sm:px-10 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <div className="px-5 sm:px-0">
            <Header />
          </div>

          <div className="flex flex-col gap-4">
            <OddsMint initialTopPrize={drawings?.topPrize.toString()} />

            <div className="mt-6 mb-12 flex flex-col gap-4 px-5 sm:px-0">
              <OddsTabs />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-5 sm:px-10 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
