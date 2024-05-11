"use client";

import Image from "next/image";
import { MyStreak } from "@/app/lib/components/MyStreak";

export const CheckIn = () => {
  return (
    <div className="flex px-2 md:justify-evenly mt-5 md:mt-8">
      <Image
        className="w-1/4 md:w-auto"
        src="/images/developer.png"
        alt="Are you here?"
        width={200}
        height={200}
        priority={true}
      />

      <div className="flex flex-col justify-center p-2 md:p-0">
        <div className="text-2xl md:text-5xl font-semibold text-[#363E36] mb-2">
          Are you here?
        </div>
        <div className="text-[#677467]">
          <p>Based Bits holder - it is time to check-in into the home base!</p>
        </div>

        <div className="mt-8">
          <MyStreak />
        </div>
      </div>
    </div>
  );
};
