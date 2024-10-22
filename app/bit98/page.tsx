import { Header } from "@/app/lib/components/client/Header";

import { Footer } from "@/app/lib/components/Footer";
import { MintRules } from "@/app/bit98/components/MintRules";
import { getBit98CurrentMint } from "@/app/lib/api/getBit98CurrentMint";
import { getBit98MintById } from "@/app/lib/api/getBit98MintById";
import { MintComponent } from "@/app/bit98/components/MintComponent";
import { revalidatePath } from "next/cache";
import { getNFTRawMetadata } from "@/app/lib/api/getNFTRawMetadata";
import { Bit98ABI } from "@/app/lib/abi/Bit98.abi";
import { truncateAddress } from "@/app/lib/utils/addressUtils";

export async function generateMetadata() {
  const id = await getBit98CurrentMint();
  const mint = await getBit98MintById({ id });
  const meta = await getNFTRawMetadata({
    abi: Bit98ABI,
    address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
    id: id,
  });

  const title = `${meta.name}`;

  let description = mint.settledAt
    ? `Mint ended! ${mint.mints} editions minted! Raffle won by ${truncateAddress(mint.winner)}`
    : `Live mint! ${mint.mints} editions minted so far!`;

  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/bit98`;

  return {
    title: title,
    description: description,
    other: {
      ["fc:frame"]: "vNext",
      ["fc:frame:image:aspect_ratio"]: "1:1",
      ["fc:frame:image"]: ogPreviewPath,
      ["fc:frame:button:1"]: `View Details`,
      ["fc:frame:button:1:action"]: "link",
      ["fc:frame:button:1:target"]: `${process.env.NEXT_PUBLIC_URL}/bit98/${id}`,
      ["fc:frame:button:2"]: `Mint`,
      ["fc:frame:button:2:action"]: "tx",
      ["fc:frame:button:2:target"]: `${process.env.NEXT_PUBLIC_URL}/api/bit98/${id}`,
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
  const id = await getBit98CurrentMint();
  const mint = await getBit98MintById({ id });
  const meta = await getNFTRawMetadata({
    abi: Bit98ABI,
    address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
    id: id,
  });

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <MintComponent
            meta={meta}
            mint={mint}
            revalidate={async () => {
              "use server";
              revalidatePath(`/bit98`, "layout");
            }}
          />
          <MintRules />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
