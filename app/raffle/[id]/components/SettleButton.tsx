"use client";

import {useAccount, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {useEffect} from "react";
import {BBitsRaffleABI} from "@/app/lib/abi/BBitsRaffle.abi";

interface FreeEntryButtonProps {
    onSuccess?: () => void;
}

export const SettleButton = ({onSuccess}: FreeEntryButtonProps) => {

    const {isConnected} = useAccount();

    const {data, writeContract} = useWriteContract();
    const {isFetching, isSuccess} = useWaitForTransactionReceipt({
        hash: data,
    });

    useEffect(() => {
        if (isSuccess && onSuccess) {
            onSuccess();
        }
    }, [isSuccess]);

    const settle = () => {
        writeContract({
            abi: BBitsRaffleABI,
            address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
            functionName: "settleRaffle",
        });
    };

    if (!isConnected) {
        return <div className="text-[#677467] mt-4">Awaiting settlement...</div>
    }


    return <button
        onClick={settle}
        disabled={isFetching}
        className="bg-[#303730] hover:bg-[#677467] text-[#DDF5DD] py-2 px-4 rounded w-full">
        {isFetching ? "Settling..." : "Settle Raffle"}
    </button>

};
