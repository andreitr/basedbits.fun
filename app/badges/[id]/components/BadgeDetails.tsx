"use client";

import Image from "next/image";

interface BadgeProps {
  id: number;
}

export const BadgeDetails = ({ id }: BadgeProps) => {
  return (
    <div className="flex flex-col justify-between mt-8 sm:flex-row gap-8">
      <Image
        className="w-auto max-w-72 m-auto sm:m-0 opacity-60 hover:opacity-100 transition duration-300 ease-in-out"
        src="/images/badges/1.png"
        alt="Are you here?"
        width={250}
        height={250}
        priority={true}
      />
      <div className="flex flex-col justify-center mt-8 sm:mt-0 sm:ml-4">
        <div className="text-6xl font-semibold text-[#363E36] mb-4">
          First Click OG
        </div>
        <div className="text-[#677467]">
          <p>
            This badge can only be minted by the brave souls who checked into
            Based Bits during the fist week.{" "}
          </p>
        </div>
        <div className="mt-8">Login to mint!</div>
      </div>
    </div>
  );
};
