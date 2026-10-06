import { MintButton } from "@/app/burn/components/MintButton";
import Image from "next/image";

interface Props {
  // Server-read price (wei) so the button renders with a real price instead of a placeholder
  initialMintPrice?: string;
}

// Same card layout as the Punkalot and Evil Odds mint cards
export const MintComponent = ({ initialMintPrice }: Props) => {
  return (
    <div className="relative w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black/90 sm:rounded-lg rounded-none text-white p-5">
      <div className="flex flex-col sm:flex-row w-full gap-5">
        <div className="shrink-0">
          <Image
            src="/images/burnedbit.svg"
            alt="Burned Bit"
            width={300}
            height={300}
            className="w-full sm:w-[300px] h-auto rounded-lg"
            priority
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="sm:text-5xl text-4xl">Burned Bits</div>
          <div className="text-sm text-gray-400 pt-2">
            Every mint burns a Based Bit. The mint price is calculated based on
            the BBITS token. The max supply of 8,000 will never be reached.
          </div>
          <div className="mt-auto pt-4">
            <MintButton initialMintPrice={initialMintPrice} />
          </div>
        </div>
      </div>
    </div>
  );
};
