"use server";

import { Header } from "@/app/lib/components/Header";
import { CheckInComponent } from "@/app/lib/components/CheckInComponent";
import { Footer } from "@/app/lib/components/Footer";
import { Social } from "@/app/lib/components/Social";
import { AlchemyToken } from "@/app/lib/types/alchemy";
import { getNFTMetadata } from "@/app/lib/api/getNFTMetadata";
import { ALCHEMY_API_PATH } from "@/app/lib/constants";
import { MintComponent } from "@/app/bit98/components/MintComponent";
import { revalidatePath } from "next/cache";
import { getCurrentRaffleId } from "@/app/lib/api/getCurrentRaffleId";
import { getRaffleById } from "@/app/lib/api/getRaffleById";
import { FeatureCard } from "@/app/lib/components/FeatureCard";
import { getNFTRawMetadata } from "@/app/lib/api/getNFTRawMetadata";
import { Bit98ABI } from "@/app/lib/abi/Bit98.abi";
import { getBit98CurrentMint } from "@/app/lib/api/getBit98CurrentMint";
import { MintRules } from "@/app/bit98/components/MintRules";
import { getBit98MintById } from "@/app/lib/api/getBit98MintById";

import chatBubble from "@/app/lib/icons/social.svg";

export default async function Home() {
  const mintId = await getBit98CurrentMint();
  const raffleId = await getCurrentRaffleId();
  const raffle = await getRaffleById(raffleId);
  const mint = await getBit98MintById({ id: mintId });

  const mintMeta = await getNFTRawMetadata({
    abi: Bit98ABI,
    address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
    id: mintId,
  });

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
              link={`/bit98/${mintId}`}
            />
            <FeatureCard
              title="Enter raffle"
              description={raffleToken.name}
              image={raffleToken.image.thumbnailUrl}
              link={`/raffle/${raffleId}`}
            />
            <FeatureCard
              title="Earn tokens"
              description="Share → Earn"
              image={chatBubble}
              style={"bg-[#DDF5DD] w-[80px] h-[80px] rounded-lg"}
              link="/earn"
            />
            <FeatureCard
              title="Swap tokens"
              description="NFTs → BBITS"
              image="/images/icon.png"
              link="/token"
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
          <MintRules />
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
