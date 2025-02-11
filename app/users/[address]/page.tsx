import { Header } from "@/app/lib/components/client/Header";
import { getAddress } from "ethers";
import {
  NFTList,
  NFTListSkeleton,
} from "@/app/users/[address]/components/NFTList";
import { Footer } from "@/app/lib/components/Footer";
import { UserInfo } from "@/app/users/[address]/components/UserInfo";
import { getCheckin } from "@/app/lib/api/getCheckin";
import { getNFTsForOwner } from "@/app/lib/api/getNFTsForOwner";
import { Suspense } from "react";

interface Props {
  params: Promise<{
    address: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { address } = await params;
  const csAddress = getAddress(address);
  const lastCheckin = await getCheckin(getAddress(address));

  const title = `${lastCheckin.streak}-DAY STREAK 🔥`;
  const description = `Check-in ${lastCheckin.count} times into Based Bits!`;

  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/user?address=${csAddress}`;

  return {
    title: title,
    description: description,
    other: {
      ["fc:frame"]: "vNext",
      ["fc:frame:image"]: ogPreviewPath,
      ["fc:frame:button:1"]: `View Profile`,
      ["fc:frame:button:1:action"]: "link",
      ["fc:frame:button:1:target"]: `${process.env.NEXT_PUBLIC_URL}/users/${csAddress}`,
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
      description: description,
    },
  };
}

export default async function Page(props: Props) {
  const params = await props.params;

  const { address } = params;

  const csAddress = getAddress(address);
  const lastCheckin = await getCheckin(csAddress);
  const userNFTs = await getNFTsForOwner({
    address: csAddress,
    contract: [
      process.env.NEXT_PUBLIC_BB_NFT_ADDRESS,
      process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS,
      process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS,
    ].toString(),
  });

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
        </div>
      </div>
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="flex flex-col gap-8 container max-w-screen-lg mb-10">
          <UserInfo checkin={lastCheckin} address={getAddress(address)} />
          <Suspense fallback={<NFTListSkeleton />}>
            <NFTList list={userNFTs.ownedNfts} />
          </Suspense>
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
