"use server";

import { Header } from "@/app/lib/components/Header";
import { Footer } from "@/app/lib/components/Footer";
import { MintRules } from "@/app/emojibits/components/MintRules";
import { getEmojiMintById } from "@/app/lib/api/getEmojiMintById";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { getNFTMetadata } from "@/app/lib/api/getNFTMetadata";
import { ALCHEMY_API_PATH } from "@/app/lib/constants";
import { truncateAddress } from "@/app/lib/utils/addressUtils";
import { getEmojiCurrentMint } from "@/app/lib/api/getEmojiCurrentMint";
import { MintComponent } from "@/app/emojibits/components/MintComponent";
import { revalidatePath } from "next/cache";

export async function generateMetadata() {
  const id = await getEmojiCurrentMint();
  const mint = await getEmojiMintById({ id });
  const token: AlchemyToken = await getNFTMetadata({
    contract: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as string,
    path: ALCHEMY_API_PATH.MAINNET,
    tokenId: mint.tokenId.toString(),
  });

  const title = `${token.name}`;

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
  const token: AlchemyToken = await getNFTMetadata({
    contract: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as string,
    path: ALCHEMY_API_PATH.MAINNET,
    tokenId: id.toString(),
  });

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-6 mb-8">
            <div className="text-4xl">
              <span className="hidden md:inline">🔆 OᑎᑕᕼᗩIᑎ ᔑᑌᗰᗰEᖇ 🔆</span>{" "}
              Emoji Bits
            </div>
            <div className="hidden md:inline">
              A new Emoji Bit is born every 8 hours! Half of mint proceeds are
              raffled 🏆 the rest burned via BBITS 🔥
            </div>
            <MintComponent
              token={token}
              mint={mint}
              revalidate={async () => {
                "use server";
                revalidatePath(`/emojibits`, "layout");
              }}
            />
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
