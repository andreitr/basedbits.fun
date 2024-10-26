"use server";

import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import Image from "next/image";
import { MintedList } from "@/app/burn/components/MintedList";
import { getNFTCollectionMetadata } from "@/app/lib/api/getNFTCollectionMetadata";
import { ALCHEMY_API_PATH } from "@/app/lib/constants";
import Link from "next/link";
import { MintPrice } from "@/app/burn/components/MintPrice";

export default async function Page() {
  const collection = await getNFTCollectionMetadata({
    contract: "0x617978b8af11570c2dab7c39163a8bde1d282407",
    path: ALCHEMY_API_PATH.MAINNET,
  });

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <div className="w-full flex flex-col md:flex-row gap-20 justify-between bg-black bg-opacity-90 text-white rounded-lg p-6">
            <div>
              <div className="text-5xl mb-2">Burned Bits</div>
              <div>
                Every mint burns a Based Bit. The mint price is calculated based
                on the BBITS token. The max supply of 8,000 will never be
                reached.
              </div>
              <div className="my-10 text-yellow-400">
                <div>Mint Price: 0.005E</div>
              </div>
              <div className="flex flex-row mt-6 gap-6">
                <div className="bg-red-500 p-4 rounded-lg">
                  Mint for 0.0005E
                </div>
                <div className="bg-red-500 p-4 rounded-lg">Mint with BBITS</div>
              </div>
            </div>

            <div>
              <Image
                className="rounded-lg"
                src={"/images/burnedbit.avif"}
                alt="Preview"
                width="360"
                height="360"
              />
            </div>
          </div>

          <MintPrice />

          <div className="mt-10 mb-5 flex flex-row justify-between">
            <div>Burned supply {collection.totalSupply}</div>
            <div className="hover:underline">
              <Link
                href={`https://opensea.io/assets/base/0x617978b8af11570c2dab7c39163a8bde1d282407`}
                target="_blank"
              >
                view on OpenSea
              </Link>
            </div>
          </div>
          <MintedList contract="0x617978b8af11570c2dab7c39163a8bde1d282407" />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
