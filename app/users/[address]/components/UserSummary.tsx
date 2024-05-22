"use client";

import Image from "next/image";
import {truncateAddress} from "@/app/lib/utils/addressUtils";

interface UserSummaryProps {
    address: string
}

export const UserSummary = ({address}: UserSummaryProps) => {

    return (
        <div className="flex flex-col justify-evenly mt-8 sm:flex-row">
            <Image
                className="w-auto max-w-72 m-auto sm:m-0"
                src="/images/developer.png"
                alt="Are you here?"
                width={250}
                height={250}
                priority={true}
            />

            <div className="flex flex-col justify-center mt-8 sm:mt-0 sm:ml-4">

                <div className="flex flex-col text-[#677467]">
                    <div>Loading activity for {truncateAddress(address)}</div>
                </div>

            </div>
        </div>
    );
};
