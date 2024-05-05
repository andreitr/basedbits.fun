"use client";

import {abi} from "@/app/lib/abi/basedbits.abi";
import {useAccount, useConnect, useReadContract} from "wagmi";
import BigNumber from "bignumber.js";
import {injected} from "@wagmi/connectors";
import {CheckInButton} from "@/app/lib/components/CheckIn";

export const MyStreak = () => {

    const {address, isConnected} = useAccount();
    const {connect, connectors} = useConnect()

    const {data, isFetched, isFetching} = useReadContract({
        abi: abi,
        address: '0x7822465cD6F5A553F464F82ADA1b2ea33bCB2634',
        functionName: 'userData',
        args: [address],
    });

    if (!isConnected) {
        return <button onClick={() => connect({connector: injected()})}>Connect to Check-in</button>;
    }

    if (data) {
        let [lastCheckin, streak, checkin] = data as [BigNumber, BigNumber, BigNumber];

        return <div>
            <div>streak: {new BigNumber(streak).toNumber()}</div>
            <div>checkins: {new BigNumber(checkin).toNumber()}</div>
            <div>last check-in: {new Date(new BigNumber(lastCheckin).toNumber() * 1000).toLocaleString()}</div>
            <div className="mt-5">
                <CheckInButton/>
            </div>
        </div>
    }
}