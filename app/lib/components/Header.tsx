"use client";

import {ConnectKitButton} from "connectkit";
import Image from "next/image";
import Link from "next/link";

export const Header = () => {
    return (
        <div className="flex flex-row py-6 text-right justify-between">
            <Link href={"/"} title="Home">
                <div className="bg-[#ABBEAC] px-5 py-2 rounded-lg cursor-pointer">
                    <Image
                        className="width-auto"
                        src="/images/noggles.png"
                        alt="Nerd Noggles"
                        width={65}
                        height={90}
                        priority={true}
                    />
                </div>
            </Link>

            <ConnectKitButton/>
        </div>
    );
};
