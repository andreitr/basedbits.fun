"use client";

import {ConnectKitButton} from "connectkit";
import Image from "next/image";

export const Header = () => {
    return (
        <div className="flex flex-row py-6 text-right justify-between">
            <div className="bg-[#ABBEAC] px-5 py-2 rounded-lg">
                <Image
                    src="/images/noggles.png"
                    alt="Nerd Noggles"
                    width={65}
                    height={90}
                    priority={true}
                />
            </div>

            <ConnectKitButton/>
        </div>
    );
};
