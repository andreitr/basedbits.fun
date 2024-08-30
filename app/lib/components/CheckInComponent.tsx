"use client";

import Image from "next/image";
import { MyStreak } from "@/app/lib/components/MyStreak";

interface Props {
  revalidate: () => void;
}

export const CheckInComponent = ({ revalidate }: Props) => {
  return (
    <div className="flex flex-col justify-between mt-8 sm:flex-row">
      <Image
        className="w-auto max-w-72 m-auto sm:m-0"
        src="/images/developer.png"
        alt="Are you here?"
        width={250}
        height={250}
        priority={true}
      />

      <div className="flex flex-col justify-center mt-8 sm:mt-0 sm:ml-4">
        <div className="text-4xl font-semibold text-[#363E36] mb-4">
          Daily Check-In
        </div>
        <div className="text-[#677467]">
          <p>
            Check-ins unlock mint discounts, free raffle entries, and social
            posts!
          </p>
        </div>

        <div className="mt-8">
          <MyStreak revalidate={revalidate} />
        </div>
      </div>
    </div>
  );
};
