import { Header } from "@/app/lib/components/client/Header";
import { getAddress } from "ethers";
import { NFTList } from "@/app/users/[address]/components/NFTList";
import { Footer } from "@/app/lib/components/Footer";
import { UserInfo } from "@/app/users/[address]/components/UserInfo";
import { getCheckin } from "@/app/lib/api/getCheckin";

interface Props {
  params: {
    address: string;
  };
}

export async function generateMetadata({ params: { address } }: Props) {
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

export default async function Page({ params: { address } }: Props) {
  const lastCheckin = await getCheckin(getAddress(address));

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
          <NFTList address={getAddress(address) as `0x${string}`} />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
