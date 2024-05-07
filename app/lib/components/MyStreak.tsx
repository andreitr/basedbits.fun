"use client";

import {BBitsCheckInABI} from "@/app/lib/abi/BBitsCheckIn.abi";
import {useAccount, useReadContract} from "wagmi";
import BigNumber from "bignumber.js";
import {CheckInTimer} from "@/app/lib/components/CheckInTimer";

export const MyStreak = () => {

    const {address, isConnected} = useAccount();

    const {data, isFetched, isFetching} = useReadContract({
        abi: BBitsCheckInABI,
        address: '0xE842537260634175891925F058498F9099C102eB',
        functionName: 'checkIns',
        args: [address],
    });

    if (!data) {
        return;
    }

    let [lastCheckin, streak, count] = data as [0, 0, 0];

    if (count === 0) {
        return <div>
            <div className="text-gray-600">no check-ins is sad :(</div>
        </div>
    }

    if (count > 0) {
        return <div>
            <div className="text-xl font-semibold">🔥 {new BigNumber(streak).toNumber()}-day streak 🔥</div>
            <div className="text-gray-600">Check-in score: {count}/{streak}</div>

            <div className="mt-5">
                <CheckInTimer time={lastCheckin}/>
            </div>
        </div>
    }
}