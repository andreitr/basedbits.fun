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
import { MintComponent } from "@/app/burn/components/MintComponent";

export async function generateMetadata() {
  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/burn`;

  const title = "Burned Bits";
  const description = "Mint a Burned Bit to burn a Based Bit!";

  return {
    title: title,
    description: description,
    other: {
      ["fc:frame"]: "vNext",
      ["fc:frame:image"]: ogPreviewPath,
      ["fc:frame:button:1"]: `Learn More`,
      ["fc:frame:button:1:action"]: "link",
      ["fc:frame:button:1:target"]: `${process.env.NEXT_PUBLIC_URL}/burn`,

      ["fc:frame:button:2"]: `Mint`,
      ["fc:frame:button:2:action"]: "tx",
      ["fc:frame:button:2:target"]: `${process.env.NEXT_PUBLIC_URL}/api/burn`,
    },
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
  const collection = await getNFTCollectionMetadata({
    contract: process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS!,
    path: ALCHEMY_API_PATH.MAINNET,
  });

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <MintComponent
            revalidate={async () => {
              "use server";
              revalidatePath(`/burn`, "layout");
            }}
          />

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
