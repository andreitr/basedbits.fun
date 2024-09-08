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
import Image from "next/image";
import { getRaffleById } from "@/app/lib/api/getRaffleById";

export default async function Home() {
  const emojiBitsId = await getEmojiCurrentMint();
  const raffleId = await getCurrentRaffleId();
  const raffle = await getRaffleById(raffleId);
  const mint = await getEmojiMintById({ id: emojiBitsId });

  const token: AlchemyToken = await getNFTMetadata({
    contract: process.env.NEXT_PUBLIC_BB_EMOJI_BITS_ADDRESS as string,
    path: ALCHEMY_API_PATH.MAINNET,
    tokenId: emojiBitsId.toString(),
    tokenType: "ERC1155",
    refreshCache: false,
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

      <div className="flex justify-center items-center text-white bg-black w-full lg:px-0 pb-8 sm:pb-0">
        <div className="container flex flex-row justify-between items-center max-w-screen-lg py-5 gap-10">
          <div>STUFF TO DO HERE</div>
          <div className="flex flex-row gap-2 rounded-lg bg-white bg-opacity-20">
            <Image
              className="rounded-lg w-full md:w-[80px] md:h-[80px] bg-[#0052FF]"
              src={token.image.originalUrl}
              alt={token.name}
              width={80}
              height={80}
            />
            <div className="flex flex-col justify-center pr-4">
              <div>Mint</div>
              <div>{token.name}</div>
            </div>
          </div>
          <div className="flex flex-row gap-2 rounded-lg bg-white bg-opacity-20">
            <Image
              className="rounded-lg w-full md:w-[80px] md:h-[80px] bg-[#DDF5DD]"
              src={raffleToken.image.thumbnailUrl}
              alt={raffleToken.name}
              width={80}
              height={80}
            />
            <div className="flex flex-col justify-center pr-4">
              <div>Enter raffle</div>
              <div>{raffleToken.name}</div>
            </div>
          </div>
          <div className="flex flex-row gap-2 rounded-lg bg-white bg-opacity-20">
            <Image
              className="rounded-lg w-full md:w-[80px] md:h-[80px] bg-[#DDF5DD]"
              src="/images/icon.png"
              alt="BBITS TOkEN"
              width={80}
              height={80}
            />
            <div className="flex flex-col justify-center pr-4">
              <div>Swap BBITS</div>
              <div>NFTs to BBITS</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full pt-10 px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <MintComponent
            token={token}
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
