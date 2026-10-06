import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import { getTokenTotalSupply } from "@/app/lib/api/getTokenTotalSupply";
import { formatUnits } from "ethers";
import Link from "next/link";
import { getUserTokenBalance } from "@/app/lib/api/getUserTokenBalance";
import { TokenSwap } from "@/app/token/components/TokenSwap";
import { getTokenPriceHistory } from "@/app/lib/api/getTokenPriceHistory";
import { TokenPriceChart } from "@/app/token/components/TokenPriceChart";

// Static page regenerated in the background so visitors don't wait on the RPC and price-history reads per request
export const revalidate = 60;

export default async function Page() {
  const [tokens, burned, history] = await Promise.all([
    getTokenTotalSupply(),
    getUserTokenBalance("0x000000000000000000000000000000000000dEaD"),
    getTokenPriceHistory(),
  ]);

  const supply = Number(formatUnits(tokens));
  const burnedPercent =
    supply > 0 ? (Number(formatUnits(burned)) / supply) * 100 : 0;

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-5 sm:px-10">
        <div className="container max-w-screen-lg">
          <Header />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="text-3xl sm:text-4xl py-0 my-0">
                {burnedPercent.toFixed(1)}% of circulating supply Burned
              </div>
              <div className="text-gray-600 items-center">
                Each Based Bit NFT can be exchanged for 1024 BBITS tokens, and
                vice versa. The maximum token supply is 8,192,000. The{" "}
                <Link
                  href="https://basescan.org/address/0x553c1f87c2ef99cca23b8a7ffaa629c8c2d27666"
                  className="underline"
                  target="_blank"
                >
                  token contract
                </Link>{" "}
                is immutable, and BBITS tokens are{" "}
                <Link
                  href="https://app.uniswap.org/explore/tokens/base/0x553C1f87C2EF99CcA23b8A7fFaA629C8c2D27666?chain=base"
                  className="underline"
                  target="_blank"
                >
                  traded on Uniswap.
                </Link>
              </div>
            </div>

            <TokenPriceChart history={history} />
          </div>
        </div>
      </div>

      <TokenSwap />

      <div className="flex justify-center items-center w-full px-5 sm:px-10 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
