import { Header } from "@/app/lib/components/Header";
import { getNFTsForAddress } from "@/app/lib/api/getNFTsForAddress";
import Image from "next/image";
import { getUserCheckIns } from "@/app/lib/api/getUserCheckIns";

interface Props {
  params: {
    address: string;
  };
}

export default async function User({ params: { address } }: Props) {
  const contractNFTs = await getNFTsForAddress({ address, size: 1 });
  const lastCheckin = await getUserCheckIns(address);
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
        </div>
      </div>
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          Streak {lastCheckin.streak}
        </div>
        <div className="container max-w-screen-lg">
          Total {lastCheckin.count}
        </div>
      </div>

      <div className="flex flex-col items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8">
        <div>{contractNFTs.totalCount} Based Bits</div>
        <div className="grid grid-cols-7 gap-3">
          {contractNFTs.ownedNfts.map((nft, index) => {
            return (
              <div
                key={index}
                className="bg-[#ABBEAC] p-2 rounded-md sm:w-100 w-140"
              >
                <Image
                  className="rounded-lg"
                  src={nft.image.thumbnailUrl}
                  alt={nft.name}
                  width={120}
                  height={120}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
