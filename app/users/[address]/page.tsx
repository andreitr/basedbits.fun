import { Header } from "@/app/lib/components/Header";
import { getUserNFTCount } from "@/app/lib/api/getUserNFTCount";
import Image from "next/image";

interface UserProps {
  params: {
    address: string;
  };
}

export default async function User({ params: { address } }: UserProps) {
  const contractNFTs = await getUserNFTCount({ address, size: 100 });

  console.log(contractNFTs.ownedNfts);

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
        </div>
      </div>
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">{address}</div>
      </div>

      <div className="flex flex-col items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8">
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
