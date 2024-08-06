import { Header } from "@/app/lib/components/Header";
import { getNFTsForAddress } from "@/app/lib/api/getNFTsForAddress";
import { getUserCheckIns } from "@/app/lib/api/getUserCheckIns";
import { getUserTokenBalance } from "@/app/lib/api/getUserTokenBalance";
import { humanizeNumber } from "@/app/lib/utils/numberUtils";
import { formatUnits } from "ethers";
import { NFTList } from "@/app/users/[address]/components/NFTList";
import { Footer } from "@/app/lib/components/Footer";

interface Props {
  params: {
    address: string;
  };
}

export async function generateMetadata({ params: { address } }: Props) {
  const lastCheckin = await getUserCheckIns(address);
  const contractNFTs = await getNFTsForAddress({ address, size: 1 });
  const balance = await getUserTokenBalance(address as `0x${string}`);
  const token = contractNFTs.ownedNfts[0];

  const titleA = `${lastCheckin.streak}-DAY STREAK 🔥`;
  const titleB = `${lastCheckin.count} total check-in${lastCheckin.count === 1 ? "" : "s"}`;
  const description = `This wallet holds ${contractNFTs.totalCount} Based Bits and ${humanizeNumber(Math.round(Number(formatUnits(balance))))} BBITS tokens`;

  const ogPreviewPath = `/api/images/user?titleA=${encodeURIComponent(titleA)}&titleB=${encodeURIComponent(titleB)}&preview=${token.image.originalUrl}&description=${encodeURIComponent(description)}`;

  return {
    title: `${titleA} ${titleB}`,
    description: description,
    openGraph: {
      images: [
        {
          url: ogPreviewPath,
          width: 1200,
          height: 1200,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${titleA} ${titleB}`,
      description,
    },
  };
}

export default async function Page({ params: { address } }: Props) {
  const contractNFTs = await getNFTsForAddress({ address, size: 1 });
  const lastCheckin = await getUserCheckIns(address);
  const balance = await getUserTokenBalance(address as `0x${string}`);

  const title = `${lastCheckin.streak}-DAY STREAK 🔥 ${lastCheckin.count} total check-in${lastCheckin.count === 1 ? "" : "s"}`;
  const description = `This wallet holds ${contractNFTs.totalCount} Based Bits and ${humanizeNumber(Math.round(Number(formatUnits(balance))))} BBITS tokens`;

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
        </div>
      </div>
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg mb-10">
          <div className="text-4xl text-[#363E36]">{title}</div>
          <div className="mb-8">{description}</div>
          <NFTList address={address as `0x${string}`} />
        </div>
      </div>

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
