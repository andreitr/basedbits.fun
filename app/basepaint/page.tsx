import { Metadata } from "next";
import { readContract } from "@wagmi/core";
import { baseConfig } from "@/app/lib/Web3Configs";
import { BasePaintAbi } from "@/app/lib/abi/BasePaint.abi";
import { Header } from "@/app/lib/components/client/Header";
import { Footer } from "@/app/lib/components/Footer";
import Link from "next/link";

const BASEPAINT_CONTRACT_ADDRESS = "0xBa5e05cb26b78eDa3A2f8e3b3814726305dcAc83";

async function getTokenId() {
  const today = await readContract(baseConfig, {
    abi: BasePaintAbi,
    address: BASEPAINT_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "today",
  });
  return Number(today) - 1;
}

export async function generateMetadata(): Promise<Metadata> {
  const tokenId = await getTokenId();

  return {
    title: `Mint Day ${tokenId} on BasePaint`,
    description: "Every NFT minted using this link burns BBITS tokens.",
    openGraph: {
      title: `Mint Day ${tokenId} on BasePaint`,
      description: "Every NFT minted using this link burns BBITS tokens.",
      images: [
        {
          url: `https://basepaint.xyz/api/art/image?day=${tokenId}`,
          width: 1200,
          height: 1200,
        },
      ],
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": `https://basepaint.xyz/api/art/image?day=${tokenId}`,
      "fc:frame:button:1": "Mint",
      "fc:frame:button:1:action": "link",
      "fc:frame:button:1:target":
        "https://basepaint.xyz/mint?referrer=0xDAdA5bAd8cdcB9e323d0606d081E6Dc5D3a577a1",
    },
  };
}

export default function BasePaintPage() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />

          <div className="container max-w-screen-lg mb-10 bg-white rounded-lg p-4">
            Mint BasePaint using{" "}
            <Link
              href="https://basepaint.xyz/mint?referrer=0xDAdA5bAd8cdcB9e323d0606d081E6Dc5D3a577a1"
              target="_blank"
              className="text-blue-500 underline"
            >
              our link
            </Link>
            , and we will burn the referral fee so your tokens go up!
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
