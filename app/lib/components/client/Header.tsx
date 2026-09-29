"use client";

import { ConnectKitButton } from "connectkit";
import Image from "next/image";
import Link from "next/link";

export const Header = () => {
  return (
    <div className="flex flex-row py-6 items-center justify-between gap-4 mb-6 sm:mb-10">
      <Link href={"/"} title="Home" className="shrink-0">
        <div className="bg-[#ABBEAC] px-5 py-2 rounded-lg cursor-pointer">
          {/* noggles.png is 200x75, so 65 wide renders 24 tall */}
          <Image
            src="/images/noggles.png"
            alt="Nerd Noggles"
            width={65}
            height={24}
            priority={true}
          />
        </div>
      </Link>
      {/* Fixed height so the button swapping between "Connect Wallet" and the connected address doesn't move the page */}
      <div className="flex items-center justify-end h-10 min-w-0">
        <ConnectKitButton />
      </div>
    </div>
  );
};
