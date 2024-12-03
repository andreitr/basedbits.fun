import { MintButton } from "@/app/punks/components/MintButton";
import Image from "next/image";

export const MintComponent = () => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black bg-opacity-90 text-white rounded-lg p-6">
      <div>
        <Image
          className="rounded-lg"
          src={"/images/punkalot.png"}
          alt="Preview"
          width="540"
          height="540"
        />
      </div>
      <div>
        <div className="text-5xl mb-2 text-[#DBAEB4]">Punkalot</div>
        <div className="">
          Every minted punk can be endlessly remixed to create a unique
          combination of traits. The art is fully onchain, with a total supply
          of 1K.
        </div>
        <div className="mt-10 mb-5">
          <MintButton />
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
