"use server";

import { Header } from "@/app/lib/components/Header";
import { Footer } from "@/app/lib/components/Footer";
import { MintRules } from "@/app/emojibits/components/MintRules";
import { getEmojiMintById } from "@/app/lib/api/getEmojiMintById";
import { truncateAddress } from "@/app/lib/utils/addressUtils";
import { getEmojiCurrentMint } from "@/app/lib/api/getEmojiCurrentMint";
import { MintComponent } from "@/app/emojibits/components/MintComponent";
import { revalidatePath } from "next/cache";
import { EmojiBitsABI } from "@/app/lib/abi/EmojiBits.abi";
import { getNFTRawMetadata } from "@/app/lib/api/getNFTRawMetadata";

export async function generateMetadata() {
  const id = await getEmojiCurrentMint();
  const mint = await getEmojiMintById({ id });

  const meta = await getNFTRawMetadata({
    abi: EmojiBitsABI,
    address: "0xf6b0da3a3a8e23bbc7df54fe42bee302e35ea8dc",
    id: id,
  });

  const title = `${meta.name}`;

  let description = mint.settledAt
    ? `Mint ended! ${mint.mints} editions minted! Raffle won by ${truncateAddress(mint.winner)}`
    : `Live mint! ${mint.mints} editions minted so far!`;

  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/emoji`;

  return {
    title: title,
    description: description,
    other: {
      ["fc:frame"]: "vNext",
      ["fc:frame:image:aspect_ratio"]: "1:1",
      ["fc:frame:image"]: ogPreviewPath,
      ["fc:frame:button:1"]: `View Details`,
      ["fc:frame:button:1:action"]: "link",
      ["fc:frame:button:1:target"]: `${process.env.NEXT_PUBLIC_URL}/emojibits/${id}`,
      ["fc:frame:button:2"]: `Mint`,
      ["fc:frame:button:2:action"]: "tx",
      ["fc:frame:button:2:target"]: `${process.env.NEXT_PUBLIC_URL}/api/emojibits/${id}`,
    },
    openGraph: {
      images: [
        {
          url: ogPreviewPath,
          width: 840,
          height: 840,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page() {
  const id = await getEmojiCurrentMint();
  const mint = await getEmojiMintById({ id });

  const meta = await getNFTRawMetadata({
    abi: EmojiBitsABI,
    address: "0xF6B0DA3A3A8e23bBc7Df54Fe42Bee302e35ea8dc",
    id: id,
  });

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-6 mb-8">
            <MintComponent
              meta={meta}
              mint={mint}
              revalidate={async () => {
                "use server";
                revalidatePath(`/emojibits`, "layout");
              }}
            />
            <div>
              A new Emoji Bit is born every 8 hours! Half of mint proceeds are
              raffled; the rest burned via BBITS 🔥
            </div>
            <MintRules />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
