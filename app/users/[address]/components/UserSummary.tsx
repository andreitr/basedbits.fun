"use client";

import Image from "next/image";
import {truncateAddress} from "@/app/lib/utils/addressUtils";
import {useReadContract} from "wagmi";
import {BBitsCheckInABI} from "@/app/lib/abi/BBitsCheckIn.abi";
import {CheckInTimer} from "@/app/lib/components/CheckInTimer";
import BigNumber from "bignumber.js";

interface UserSummaryProps {
    address: string
}

export const UserSummary = ({address}: UserSummaryProps) => {

    const {data, isFetched} = useReadContract({
        abi: BBitsCheckInABI,
        address: process.env.NEXT_BB_CHECKINS_ADDRESS as `0x${string}`,
        functionName: "checkIns",
        args: [address],
        query: {
            enabled: !!address,
        },
    });

    if (data) {
        let [checkInTime, checkInStreak, checkInCount] = data as [BigNumber, number, number]
    }


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
                {(isFetched && data) ? (
                    <>
                        <div className="text-5xl font-semibold text-[#363E36] mb-4">
                            {checkInStreak}-Day Streak 🔥
                        </div>

                        <div className="flex flex-col text-[#677467]">

                            <div>Activity stats for {truncateAddress(address)}</div>

                            <div>Holding 11 Based Bits</div>
                            <div>Total check-ins: ${checkInCount}</div>
                            <div>Last check-in: <CheckInTimer time={checkInTime}/></div>
                        </div>
                    </>
                ) : (

                    <div className="flex flex-col text-[#677467]">
                        <div>Loading activity for {truncateAddress(address)}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
