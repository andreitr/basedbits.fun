"use client";

import {abi} from "@/app/lib/abi/basedbits.abi";
import {useAccount, useReadContract} from "wagmi";
import BigNumber from "bignumber.js";

export const MyStreak = () => {

    const {address, isConnected} = useAccount();
    const {data, isFetched, isFetching} = useReadContract({
        abi: abi,
        address: '0x7822465cD6F5A553F464F82ADA1b2ea33bCB2634',
        functionName: 'userData',
        args: [address],
    });

    if(!isConnected){
        return "Connect your wallet to see your streak data";
    }

    if (isFetching) {
        console.log("Fetching...");
        return "Loading... Please wait";
    }

    if (data) {
        let [lastCheckin, streak, checkin] = data as [BigNumber, BigNumber, BigNumber];
        return `Current streak: ${new BigNumber(streak).toNumber()}. Checkin ${new BigNumber(checkin).toNumber()} times. Last check-in ${new Date(new BigNumber(lastCheckin).toNumber() * 1000).toLocaleString()}`;
    }

    return "No streak data yet"
}