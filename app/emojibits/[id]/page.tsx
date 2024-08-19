"use server";

import { Header } from "@/app/lib/components/Header";
import { Footer } from "@/app/lib/components/Footer";
import { MintComponent } from "@/app/emojibits/components/MintComponent";
import { MintRules } from "@/app/emojibits/components/MintRules";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { getNFTMetadata } from "@/app/lib/api/getNFTMetadata";
import { truncateAddress } from "@/app/lib/utils/addressUtils";
import { getEmojiBitsMintById } from "@/app/lib/api/getEmojiBitsMintById";
import { revalidatePath } from "next/cache";
import { ALCHEMY_API_PATH } from "@/app/lib/constants";

interface Props {
  params: {
    id: number;
  };
}

export async function generateMetadata({ params: { id } }: Props) {
  const mint = await getEmojiBitsMintById({ id });
  const token: AlchemyToken = await getNFTMetadata({
    contract: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as string,
    path: ALCHEMY_API_PATH.TESTNET,
    tokenId: mint.tokenId.toString(),
  });

  const title = `${token.name}`;

  let description = mint.settledAt
    ? `Mint ended! ${mint.mints} editions minted! Raffle won by ${truncateAddress(mint.winner)}`
    : `Live mint! ${mint.mints} editions minted so far!`;

  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/emoji?title=${encodeURIComponent(title)}&preview=${token.image.originalUrl}&description=${encodeURIComponent(description)}`;

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
      title,
      description,
    },
  };
}

export default async function Page({ params: { id } }: Props) {
  const mint = await getEmojiBitsMintById({ id });
  const token: AlchemyToken = await getNFTMetadata({
    contract: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as string,
    path: ALCHEMY_API_PATH.TESTNET,
    tokenId: id.toString(),
  });

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="flex flex-col gap-6 mb-8">
            <MintComponent
              token={token}
              mint={mint}
              revalidate={async () => {
                "use server";
                revalidatePath(`/emojibits/${id}`, "layout");
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
