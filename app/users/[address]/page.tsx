import { Header } from "@/app/lib/components/client/Header";
import { getNFTsForAddress } from "@/app/lib/api/getNFTsForAddress";
import { getUserCheckIns } from "@/app/lib/api/getUserCheckIns";
import { getUserTokenBalance } from "@/app/lib/api/getUserTokenBalance";
import { humanizeNumber, streakToDiscount } from "@/app/lib/utils/numberUtils";
import { formatUnits } from "ethers";
import { NFTList } from "@/app/users/[address]/components/NFTList";
import { Footer } from "@/app/lib/components/Footer";
import { ClientWrapper } from "@/app/lib/components/ClientWrapper";
import { Avatar } from "connectkit";
import { UserInfo } from "@/app/users/[address]/components/UserInfo";

interface Props {
  params: {
    address: string;
  };
}

export async function generateMetadata({ params: { address } }: Props) {
  const lastCheckin = await getUserCheckIns(address);
  const contractNFTs = await getNFTsForAddress({ address, size: 1 });
  const balance = await getUserTokenBalance(address as `0x${string}`);

  const title = `${lastCheckin.streak}-DAY STREAK 🔥`;
  const description = `This wallet holds ${contractNFTs.totalCount} Based Bits and ${humanizeNumber(Math.round(Number(formatUnits(balance))))} BBITS tokens`;

  const ogPreviewPath = `${process.env.NEXT_PUBLIC_URL}/api/images/user?address=${address}`;

  return {
    title: title,
    description: description,
    other: {
      ["fc:frame"]: "vNext",
      ["fc:frame:image"]: ogPreviewPath,
      ["fc:frame:button:1"]: `View Profile`,
      ["fc:frame:button:1:action"]: "link",
      ["fc:frame:button:1:target"]: `${process.env.NEXT_PUBLIC_URL}/users/${address}`,

      // ["fc:frame:button:2"]: `Your Stats`,
      // ["fc:frame:button:2:action"]: "post",
      // ["fc:frame:button:2:post_url]: `Your Stats`,
      // ["fc:frame:button:2:post_url"]: `${process.env.NEXT_PUBLIC_URL}/api/checkin`,

      // ["fc:frame:button:2"]: `Check-In`,
      // ["fc:frame:button:2:action"]: "tx",
      // ["fc:frame:button:2:target"]: `${process.env.NEXT_PUBLIC_URL}/api/checkin`,
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
      description,
    },
  };
}

export default async function Page({ params: { address } }: Props) {
  const lastCheckin = await getUserCheckIns(address);

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
        </div>
      </div>
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="flex flex-col gap-8 container max-w-screen-lg mb-10">
          <UserInfo checkin={lastCheckin} address={address} />
          <NFTList address={address as `0x${string}`} />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
