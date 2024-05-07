"use client";

import {useAccount, useConnect, useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {BBitsCheckInABI} from "@/app/lib/abi/BBitsCheckIn.abi";
import {injected} from "@wagmi/connectors";
import {DateTime, Interval} from "luxon";

export const CheckInButton = () => {

    const {connect, connectors} = useConnect();
    const {address} = useAccount();
    const {isConnected} = useAccount();

    const {data, isSuccess, writeContract} = useWriteContract();
    const {isFetching} = useWaitForTransactionReceipt({hash: data});


    const {data: checkIns} = useReadContract({
        abi: BBitsCheckInABI,
        address: '0xE842537260634175891925F058498F9099C102eB',
        functionName: 'checkIns',
        args: [address],
    });

    if (!isConnected) {
        return <button onClick={() => connect({connector: injected()})}
                       className="bg-[#303730] hover:bg-[#677467] text-white py-2 px-4 rounded">Connect Wallet</button>;
    }

    // if (checkIns) {
    //     let [lastCheckin, count] = checkIns as [0, 0];
    //
    //
    //     const lastCheckinTime = DateTime.fromMillis(lastCheckin);
    //     const elapsedTime = Interval.fromDateTimes(lastCheckinTime, DateTime.now());
    //
    //     const canCheckIn = elapsedTime.toDuration('hours').hours >= 24;
    //
    //     if (!canCheckIn) {
    //         return ""
    //     }
    // }


    const checkIn = () => {
        writeContract({
            abi: BBitsCheckInABI,
            address: '0xE842537260634175891925F058498F9099C102eB',
            functionName: 'checkIn'
        })
    }

    return <button onClick={checkIn}
                   disabled={isFetching}
                   className="bg-[#303730] hover:bg-[#677467] text-white py-2 px-4 rounded">
        {isFetching ? "Checking In..." : "Check In"}
    </button>

}