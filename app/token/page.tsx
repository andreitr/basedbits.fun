import { Header } from "@/app/lib/components/Header";
import { Footer } from "@/app/lib/components/Footer";
import { getTokenTotalSupply } from "@/app/lib/api/getTokenTotalSupply";
import { getTokenNFTCount } from "@/app/lib/api/getTokenNFTCount";
import { formatUnits } from "ethers";
import Image from "next/image";
import { getUserNFTCount } from "@/app/lib/api/getUserNFTCount";
import { Deposit } from "@/app/token/components/Deposit";
import { humanizeNumber } from "@/app/lib/utils/numberUtils";

export default async function Page() {
  const tokenContractAddress = process.env.NEXT_PUBLIC_BB_TOKEN_ADDRESS || "";
  const contractNFTs = await getUserNFTCount({
    address: tokenContractAddress,
    size: 28,
  });

  const tokens = await getTokenTotalSupply();
  const count = await getTokenNFTCount();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
        <div className="container max-w-screen-lg">
          <Header />
          <div className="mb-20">
            <div className="text-4xl mb-2">
              {humanizeNumber(Number(formatUnits(tokens)))} BBITS backed by{" "}
              {count} Based Bits NFTs
            </div>
            <div>1 Based Bit = 1024 $BBITS</div>
          </div>

          <div className="mb-8">
            <Deposit />
          </div>
        </div>
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

      <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
        <Footer />
      </div>
    </div>
  );
}
