import { MintButton } from "@/app/burn/components/MintButton";
import Image from "next/image";

interface Props {
  revalidate: () => void;
}

export const MintComponent = ({ revalidate }: Props) => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-10 sm:gap-20 justify-between bg-black bg-opacity-90 text-white rounded-lg p-6">
      <div>
        <div className="text-5xl mb-2">Burned Bits</div>
        <div>
          Every mint burns a Based Bit. The mint price is calculated based on
          the BBITS token. The max supply of 8,000 will never be reached.
        </div>
        <div className="mt-10 mb-5">
          <MintButton revalidate={revalidate} />
        </div>
        <div className="text-sm text-yellow-500">
          The mint price is derived from the exchange rate of BBITS to ETH on{" "}
          <a
            className="underline"
            href="https://app.uniswap.org/explore/tokens/base/0x553C1f87C2EF99CcA23b8A7fFaA629C8c2D27666?chain=base"
            target="_blank"
          >
            Uniswap
          </a>
          .
        </div>
      </div>

      <div>
        <Image
          className="rounded-lg"
          src={"/images/burnedbit.svg"}
          alt="Preview"
          width="540"
          height="540"
        />
      </div>
    </div>
  );
};
