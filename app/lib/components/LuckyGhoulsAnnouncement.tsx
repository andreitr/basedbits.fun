import Image from "next/image";
import Link from "next/link";

export const LuckyGhoulsAnnouncement = () => {
  return (
    <div
      id="lucky-ghouls"
      className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 sm:rounded-lg rounded-none text-white p-5 scroll-mt-10"
    >
      <div className="flex flex-col sm:flex-row w-full gap-5">
        <div>
          <Image
            src="/images/lucky_ghoul.svg"
            alt="Lucky Ghoul"
            width={100}
            height={100}
            className="w-full sm:w-[400px] rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="sm:text-5xl text-4xl text-[#FEC94F]">
            Lucky Ghouls
          </div>
          <div className="text-sm text-[#E24B4B]">
            Minting October 13th · 666 Ghouls · Base
          </div>
          <div className="text-sm text-gray-400 pt-2">
            Mint proceeds flow into a shared treasury that chases the{" "}
            <Link
              href="https://megapot.io"
              className="underline hover:text-white"
              target="_blank"
            >
              Megapot
            </Link>{" "}
            jackpot daily using the collection&apos;s evil numbers. Every Ghoul
            you hold is redeemable for a % of the treasury.
          </div>
        </div>
      </div>
    </div>
  );
};
