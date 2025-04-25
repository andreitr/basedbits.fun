import { MintButton } from "@/app/burn/components/MintButton";
import Image from "next/image";

export const MintComponent = () => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black bg-opacity-90 text-white rounded-lg p-6">
      <div className="flex flex-col justify-between">
        <div>
          <div className="text-5xl mb-2">Burned Bits</div>
          <div>
            Every mint burns a Based Bit. The mint price is calculated based on
            the BBITS token. The max supply of 8,000 will never be reached.
          </div>
        </div>
        <div className="mt-5">
          <MintButton />
        </div>
      </div>
      <div>
        <Image
          className="rounded-lg"
          src={"/images/burnedbit.svg"}
          alt="Preview"
          width="460"
          height="460"
        />
      </div>
    </div>
  );
};
