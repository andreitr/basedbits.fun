"use server";

import { Header } from "@/app/lib/components/Header";
import { Footer } from "@/app/lib/components/Footer";
import Image from "next/image";
import { MintRules } from "@/app/emojibits/components/MintRules";
import { getEmojiMintById } from "@/app/lib/api/getEmojiMintById";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { getNFTMetadata } from "@/app/lib/api/getNFTMetadata";
import { ALCHEMY_API_PATH } from "@/app/lib/constants";
import { truncateAddress } from "@/app/lib/utils/addressUtils";
import { getEmojiCurrentMint } from "@/app/lib/api/getEmojiCurrentMint";
import { MintComponent } from "@/app/emojibits/components/MintComponent";
import { revalidatePath } from "next/cache";

interface FarcasterMetadata {
  [key: string]: string | number;
}

export async function generateMetadata() {
  const id = await getEmojiCurrentMint();
  const mint = await getEmojiMintById({ id });
  const token: AlchemyToken = await getNFTMetadata({
    contract: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as string,
    path: ALCHEMY_API_PATH.TESTNET,
    tokenId: mint.tokenId.toString(),
  });

  const title = `${token.name}`;

  let description = mint.settledAt
    ? `Mint ended! ${mint.mints} editions minted! Raffle won by ${truncateAddress(mint.winner)}`
    : `Live mint! ${mint.mints} editions minted so far!`;

  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/emoji?title=${encodeURIComponent(title)}&preview=${token.image.pngUrl}&description=${encodeURIComponent(description)}`;

  const other: FarcasterMetadata = {
    ["fc:frame"]: "vNext",
    ["fc:frame:image:aspect_ratio"]: "1:1",
    ["fc:frame:image"]: ogPreviewPath,
    ["fc:frame:button:1"]: `View ${token.name}`,
    ["fc:frame:button:1:action"]: "link",
    ["fc:frame:button:1:target"]: `${process.env.NEXT_PUBLIC_URL}/emojibits/${id}`,
  };

  if (!mint.settledAt) {
    other["fc:frame:button:2"] = `Mint`;
    other["fc:frame:button:2:action"] = "tx";
    other["fc:frame:button:2:target"] =
      `${process.env.NEXT_PUBLIC_URL}/api/emojibits/${id}`;
  }

  return {
    title: title,
    description: description,
    other: other,
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
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-6 mb-8">
            <div className="text-4xl">
              Emoji Bits dropping on August 22, 2024
            </div>

            <div>
              Inspired by the oldest known emoji collection (
              <a
                className="underline"
                href="https://blog.gingerbeardman.com/2024/05/10/emoji-history-the-missing-years/"
                target="_blank"
              >
                Sharp PI-4000, 1994
              </a>
              ), Emoji Bits is a fully on-chain NFT collection featuring
              experimental minting and gamification mechanisms.
            </div>

            <div className="flex flex-row gap-2 justify-between">
              <Image
                className="rounded-lg"
                src="/images/emojibit_1.png"
                alt={"Emoji Bit Preview"}
                width={180}
                height={180}
              />
              <Image
                className="rounded-lg"
                src="/images/emojibit_3.png"
                alt={"Emoji Bit Preview"}
                width={180}
                height={180}
              />
              <Image
                className="rounded-lg hidden sm:block"
                src="/images/emojibit_2.png"
                alt={"Emoji Bit Preview"}
                width={180}
                height={180}
              />
              <Image
                className="rounded-lg hidden md:block"
                src="/images/emojibit_4.png"
                alt={"Emoji Bit Preview"}
                width={180}
                height={180}
              />
              <Image
                className="rounded-lg hidden lg:block"
                src="/images/emojibit_5.png"
                alt={"Emoji Bit Preview"}
                width={180}
                height={180}
              />
            </div>

            <div>
              Every 8 hours, forever, a new Emoji Bit is born! 50% of mint
              proceeds are raffled off to one lucky winner, while the rest are
              used to burn BBITS tokens.
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
