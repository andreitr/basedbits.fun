"use client";

import { BasePaintAbi } from "@/app/lib/abi/BasePaint.abi";
import Image from "next/image";
import Link from "next/link";
import { useReadContract } from "wagmi";

interface Props {
  title: string;
  description: string;
  link: string;
  style?: string;
}

const BASEPAINT_CONTRACT_ADDRESS = "0xBa5e05cb26b78eDa3A2f8e3b3814726305dcAc83";

export const FeatureBasePaintCard = ({
  title,
  description,
  link,
  style,
}: Props) => {
  const { data: tokenId } = useReadContract({
    abi: BasePaintAbi,
    address: BASEPAINT_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "today",
  });

  const target = link.startsWith("http") ? "_blank" : "_self";
  const defaultStyle = style ? style : "bg-[#DDF5DD] rounded-lg";

  return (
    <Link
      href={link}
      target={target}
      className="flex flex-row gap-4 rounded-lg bg-white bg-opacity-20 w-full"
    >
      <div className="rounded-lg w-[80px] h-[80px]">
        {tokenId && (
          <Image
            className={`${defaultStyle}`}
            src={`https://basepaint.xyz/api/art/image?day=${Number(tokenId) - 1}`}
            alt={title}
            width={80}
            height={80}
          />
        )}
      </div>
      <div className="flex flex-col justify-center pr-4 text-sm">
        <div>{title}</div>
        <div>{description}</div>
      </div>
    </Link>
  );
};
