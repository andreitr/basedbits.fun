"use client";

import {BBitsCheckInABI} from "@/app/lib/abi/BBitsCheckIn.abi";
import {useAccount, useReadContract} from "wagmi";
import BigNumber from "bignumber.js";
import {CheckInTimer} from "@/app/lib/components/CheckInTimer";
import {CheckInButton} from "@/app/lib/components/CheckInButton";
import {useQueryClient} from "@tanstack/react-query";

export const MyStreak = () => {

    const {address, isConnected} = useAccount();
    const queryClient = useQueryClient();

    const {data, queryKey} = useReadContract({
        abi: BBitsCheckInABI,
        address: '0xE842537260634175891925F058498F9099C102eB',
        functionName: 'checkIns',
        args: [address],
    });

    const invalidate = () => {
        queryClient.invalidateQueries({queryKey});
    }

    if (!isConnected) {
        return <CheckInButton onSuccess={invalidate}/>;
    }

    if(!data) {
        return <div>
            <div className="text-gray-600">loading...</div>
        </div>
    }

    let [lastCheckin, streak, count] = data as [0, 0, 0];

    if (count === 0) {
        return <div>
            <div className="text-gray-600">no check-ins is sad :(</div>
        </div>
    }

    if (count > 0) {
        return <div>
            <div className="text-xl font-semibold">{count} checkin{count === 1 ? "" : "s"} 🔥 {new BigNumber(streak).toNumber()}-day streak</div>
            <div className="text-gray-600"></div>

            <div className="mt-5">
                <CheckInTimer time={lastCheckin}/>
            </div>
        </div>
    }
}