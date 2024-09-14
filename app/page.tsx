"use server";

import { Header } from "@/app/lib/components/Header";
import { CheckInComponent } from "@/app/lib/components/CheckInComponent";
import { Footer } from "@/app/lib/components/Footer";
import { Social } from "@/app/lib/components/Social";
import { getEmojiCurrentMint } from "@/app/lib/api/getEmojiCurrentMint";
import { getEmojiMintById } from "@/app/lib/api/getEmojiMintById";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { getNFTMetadata } from "@/app/lib/api/getNFTMetadata";
import { ALCHEMY_API_PATH } from "@/app/lib/constants";
import { MintComponent } from "@/app/emojibits/components/MintComponent";
import { revalidatePath } from "next/cache";
import { MintRules } from "@/app/emojibits/components/MintRules";
import { getCurrentRaffleId } from "@/app/lib/api/getCurrentRaffleId";
import { getRaffleById } from "@/app/lib/api/getRaffleById";
import { FeatureCard } from "@/app/lib/components/FeatureCard";
import { getNFTRawMetadata } from "@/app/lib/api/getNFTRawMetadata";

export default async function Home() {
  const mintId = await getEmojiCurrentMint();

  const raffleId = await getCurrentRaffleId();
  const raffle = await getRaffleById(raffleId);
  const mint = await getEmojiMintById({ id: mintId });
  const mintMeta = await getNFTRawMetadata({ id: mintId });

  const raffleToken: AlchemyToken = await getNFTMetadata({
    contract: process.env.NEXT_PUBLIC_BB_NFT_ADDRESS as string,
    path: ALCHEMY_API_PATH.MAINNET,
    tokenId: raffle.sponsor.tokenId.toString(),
    tokenType: "ERC721",
    refreshCache: false,
  });

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
              title="Mint"
              description={mintMeta.name}
              image={mintMeta.image}
              link={`/emojibits/${mintId}`}
            />
            <FeatureCard
              title="Enter raffle"
              description={raffleToken.name}
              image={raffleToken.image.thumbnailUrl}
              link={`/raffle/${raffleId}`}
            />
            <FeatureCard
              title="Get tokens"
              description="NFTs → BBITS"
              image="/images/icon.png"
              link="/token"
            />
            <FeatureCard
              title="Upcoming mint"
              description="Filter8 Collab"
              image="/images/bit98_1.png"
              link="https://warpcast.com/andreitr.eth/0x99b872e3"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full pt-10 px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg mb-10">
          <MintComponent
            meta={mintMeta}
            mint={mint}
            revalidate={async () => {
              "use server";
              revalidatePath(`/`, "layout");
            }}
          />
          <div className="mb-6">
            A new Emoji Bit is born every 8 hours! Half of mint proceeds are
            raffled; the rest burned via BBITS 🔥
          </div>
          <div className="hidden md:inline">
            <MintRules />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full bg-[#859985] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Social />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
