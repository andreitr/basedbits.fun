import Image from "next/image";
import Link from "next/link";

export const MintComponent = () => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 sm:gap-10 md:gap-20 justify-between bg-black bg-opacity-90 text-white rounded-lg p-5 sm:p-6">
      <div className="md:w-1/2 lg:w-[540px] shrink-0">
        <Image
          className="rounded-lg w-full h-auto"
          src={"/images/punkalot.png"}
          alt="Preview"
          width={540}
          height={540}
          sizes="(min-width: 1024px) 540px, (min-width: 768px) 50vw, 100vw"
          priority
        />
      </div>
      <div>
        <div className="text-4xl sm:text-5xl mb-2 text-[#DBAEB4]">Punkalot</div>
        <div className="">
          Every minted punk can be endlessly remixed to create a unique
          combination of traits. The art is fully onchain, with a total supply
          of 1K.
        </div>
        <div className="mt-10 mb-5">
          <Link
            className="inline-block text-center bg-[#53A3FC] hover:bg-[#3B7AFF] text-xl font-bold py-3 px-4 rounded-lg w-full sm:w-auto"
            href="/punks"
          >
            Sold Out!
          </Link>
        </div>
        <div className="text-sm text-[#82BCFC]">
          The mint proceeds are split between{" "}
          <a
            className="underline"
            href="https://warpcast.com/gretagremplin"
            target="_blank"
          >
            gretagremplin.eth
          </a>{" "}
          and Based Bits burn!
        </div>
      </div>
    </div>
  );
};
