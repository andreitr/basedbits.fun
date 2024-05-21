"use client";

import {BBitsCheckInABI} from "@/app/lib/abi/BBitsCheckIn.abi";
import {useAccount, useReadContract} from "wagmi";
import {CheckInTimer} from "@/app/lib/components/CheckInTimer";
import {CheckInButton} from "@/app/lib/components/CheckInButton";
import {useQueryClient} from "@tanstack/react-query";
import BigNumber from "bignumber.js";

export const MyStreak = () => {
    const {address, isConnected} = useAccount();
    const queryClient = useQueryClient();

    const {data, queryKey, isFetched, isFetching} = useReadContract({
        abi: BBitsCheckInABI,
        address: process.env.BB_CHECKINS_ADDRESS as `0x${string}`,
        functionName: "checkIns",
        args: [address],
        query: {
            enabled: isConnected,
        },
    });

    const invalidate = () => {
        queryClient.invalidateQueries({queryKey});
    };

    if (!isConnected) {
        return <div className="text-[#677467] mb-5">connect wallet → check-in</div>;
    }

    if (isFetched && data) {
        let [lastCheckin, streak, count] = data as [BigNumber, number, number];

        return (
            <div>
                <div className="text-[#363E36] text-xl font-semibold">
                    {count} check-in{count === 1 ? "" : "s"} 🔥 {streak}-day streak
                </div>

                <div className="py-5">
                    <CheckInTimer time={lastCheckin}/>
                </div>

                <CheckInButton time={lastCheckin} onSuccess={invalidate}/>
            </div>
        );
    }
};
