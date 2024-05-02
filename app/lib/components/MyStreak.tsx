"use client";

import {abi} from "@/app/lib/abi/basedbits.abi";
import {useReadContract} from "wagmi";
import {createConfig, http} from '@wagmi/core'
import {base} from "wagmi/chains";
import BigNumber from "bignumber.js";

export const MyStreak = () => {

    const config = createConfig({
        chains: [base],
        transports: {
            [base.id]: http(),
        },
    })

    const {data, isFetched, isFetching} = useReadContract({
        config: config,
        abi: abi,
        address: '0x255a67BA626DB57C766eF4D010a9a11810edCC98',
        functionName: 'userData',
        args: ['0x1d671d1B191323A38490972D58354971E5c1cd2A'],
    })


    if (isFetching) {
        console.log("Fetching...");
        return "Loading... Please wait";
    }

    if (data) {
        let lastCheckin = new BigNumber(data[0]).toNumber();
        let streak = new BigNumber(data[1]).toNumber();
        let checkin = new BigNumber(data[2]).toNumber();
        return `Current streak: ${streak}. Checkin ${checkin} times. Last check-in ${new Date(lastCheckin * 1000).toLocaleString()}`;
    }

    return "No streak data yet"
}