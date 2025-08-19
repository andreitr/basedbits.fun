import Image from "next/image";

export const PromoComponent = () => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 rounded-lg text-white p-5">
      <div className="w-full flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row w-full gap-5 items-center justify-center">
          <Image
            className="hidden sm:block rounded-lg w-full sm:w-[120px] h-auto sm:h-[120px]"
            src={"/images/raider_black.svg"}
            alt={"PotRaider"}
            width={120}
            height={120}
            priority
          />
          <div className="flex flex-col-reverse sm:flex-col lg:gap-7 justify-between w-full">
            <div>
              <div className="flex flex-col gap-2">
                <div className="text-2xl text-[#FEC94F]">
                  The Megapot raid starts on August 19
                </div>
                <div className="text-sm text-gray-400">
                  The Pot Raider is an experimental 1K NFT collection. Mint
                  proceeds will be used to buy Megapot lottery tickets every day
                  for one year. There are no whitelists, free mints, or
                  discounts. Each NFT can be redeemed for a share of the
                  treasury.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
