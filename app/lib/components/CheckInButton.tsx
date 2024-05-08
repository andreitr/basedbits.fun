"use client";

import {useAccount, useConnect, useDisconnect, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {BBitsCheckInABI} from "@/app/lib/abi/BBitsCheckIn.abi";
import {injected, metaMask} from "@wagmi/connectors";

import {useEffect} from "react";

interface CheckInButtonProps {
    onSuccess: () => void;
}

export const CheckInButton = ({onSuccess}: CheckInButtonProps) => {

    const {connect} = useConnect();
    const {disconnect} = useDisconnect();

    const {address,} = useAccount();
    const {isConnected} = useAccount();

    const {data, writeContract} = useWriteContract();
    const {isFetching, isSuccess} = useWaitForTransactionReceipt({hash: data});

    useEffect(() => {
        if (isSuccess) {
            onSuccess();
        }
    }, [isSuccess, isSuccess]);

    if (!isConnected) {
        return <button onClick={() => connect({connector: metaMask()})}
                       className="bg-[#303730] hover:bg-[#677467] text-white py-2 px-4 rounded">Connect Wallet</button>;
    }

    const checkIn = () => {
        writeContract({
            abi: BBitsCheckInABI,
            address: '0xE842537260634175891925F058498F9099C102eB',
            functionName: 'checkIn',
            args: [address],
        })
    }


    return <button onClick={checkIn}
                   disabled={isFetching}
                   className="bg-[#303730] hover:bg-[#677467] text-white py-2 px-4 rounded">
        {isFetching ? "Checking In..." : "Check In"}
    </button>
}