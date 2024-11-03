"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import Image from "next/image";
import { MintedList } from "@/app/burn/components/MintedList";
import { getNFTCollectionMetadata } from "@/app/lib/api/getNFTCollectionMetadata";
import { ALCHEMY_API_PATH } from "@/app/lib/constants";
import Link from "next/link";
import { MintButton } from "@/app/burn/components/MintButton";
import { revalidatePath } from "next/cache";

export default async function Page() {
  const collection = await getNFTCollectionMetadata({
    contract: process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS!,
    path: ALCHEMY_API_PATH.MAINNET,
  });

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black bg-opacity-90 text-white rounded-lg p-6">
            <div>
              <div className="text-5xl mb-2">Burned Bits</div>
              <div>
                Every mint burns a Based Bit. The mint price is calculated based
                on the BBITS token. The max supply of 8,000 will never be
                reached.
              </div>
              <div className="mt-10 mb-5">
                <MintButton
                  revalidate={async () => {
                    "use server";
                    revalidatePath(`/burn`, "layout");
                  }}
                />
              </div>
              <div className="text-sm text-yellow-500">
                The mint price is derived from the exchange rate of BBITS to ETH
                on{" "}
                <a
                  className="underline"
                  href="https://app.uniswap.org/explore/tokens/base/0x553C1f87C2EF99CcA23b8A7fFaA629C8c2D27666?chain=base"
                  target="_blank"
                >
                  Uniswap
                </a>{" "}
                and includes a 1% slippage.
              </div>
            </div>

            <div>
              <Image
                className="rounded-lg"
                src={"/images/burnedbit.png"}
                alt="Preview"
                width="540"
                height="540"
              />
            </div>
          </div>

          <div className="mt-10 mb-5 flex flex-row justify-between">
            <div>Minted Bits {collection.totalSupply}</div>
            <div className="hover:underline">
              <Link
                href={`https://opensea.io/assets/base/${process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS}`}
                target="_blank"
              >
                View on OpenSea
              </Link>
            </div>
          </div>
          <div className="mb-10">
            <MintedList
              contract={process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS!}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
