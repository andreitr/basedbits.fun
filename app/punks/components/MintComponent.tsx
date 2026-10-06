import Image from "next/image";
import Link from "next/link";

// Same card layout as the Evil Odds mint card
export const MintComponent = () => {
  return (
    <div className="relative w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 sm:rounded-lg rounded-none text-white p-5">
      <div className="flex flex-col sm:flex-row w-full gap-5">
        <div className="shrink-0">
          <Image
            src="/images/punkalot.png"
            alt="Punkalot"
            width={300}
            height={300}
            sizes="(min-width: 640px) 300px, 100vw"
            className="w-full sm:w-[300px] h-auto rounded-lg"
            priority
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="sm:text-5xl text-4xl text-[#DBAEB4]">Punkalot</div>
          <div className="text-sm text-gray-400 pt-2">
            Every minted punk can be endlessly remixed to create a unique
            combination of traits. The art is fully onchain, with a total supply
            of 1K.
          </div>
          <div className="text-sm text-[#82BCFC]">
            The mint proceeds are split between{" "}
            <a
              className="underline hover:text-white"
              href="https://warpcast.com/gretagremplin"
              target="_blank"
              rel="noopener noreferrer"
            >
              gretagremplin.eth
            </a>{" "}
            and Based Bits burn!
          </div>
          <div className="mt-auto pt-4">
            <Link
              className="flex w-full h-[50px] items-center justify-center bg-[#53A3FC] hover:bg-[#3B7AFF] text-xl font-bold px-4 rounded-lg"
              href="/punks"
            >
              Sold Out!
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
