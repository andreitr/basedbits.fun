"use client";

import {useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {useEffect} from "react";
import {BBitsRaffleABI} from "@/app/lib/abi/BBitsRaffle.abi";
import {parseUnits} from "viem";

interface FreeEntryButtonProps {
    id: number;
    onSuccess?: () => void;
}

export const EntryButton = ({id, onSuccess}: FreeEntryButtonProps) => {
    const {address, isConnected} = useAccount();

    const {data, error, writeContract} = useWriteContract();
    const {isFetching, isSuccess} = useWaitForTransactionReceipt({
        hash: data,
    });

    console.log(error?.message);

    useEffect(() => {
        if (isSuccess && onSuccess) {
            onSuccess();
        }
    }, [isSuccess, onSuccess]);


    const {data: hasEligibility, isFetched: eligibitlityFetched} = useReadContract({
        abi: BBitsRaffleABI,
        address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
        functionName: "isEligibleForFreeEntry",
        args: [address]
    });


    const {data: hasExistingEntry, isFetched: existingEntryFetched} = useReadContract({
        abi: BBitsRaffleABI,
        address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
        functionName: "hasEnteredRaffle",
        args: [id, address]
    });


    const freeEntry = () => {

        writeContract({
            abi: BBitsRaffleABI,
            address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
            functionName: "newFreeEntry",
        });
    };

    const paidEntry = () => {
        writeContract({
            abi: BBitsRaffleABI,
            address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
            functionName: "newPaidEntry",
            value: BigInt(800000000000),
        });
    }


    if (!eligibitlityFetched) {
        return "Fetching eligibility...";
    }

    if (eligibitlityFetched && hasEligibility) {

        if (existingEntryFetched && hasExistingEntry) {
            return <button
                disabled={true}
                className="bg-[#677467] text-[#DDF5DD] py-2 px-4 rounded w-full"
            >
                Entry is recorded! Good luck
            </button>
        }

        return <button
            onClick={freeEntry}
            disabled={isFetching}
            className="bg-[#303730] hover:bg-[#677467] text-[#DDF5DD] py-2 px-4 rounded w-full">
            {isFetching ? "Posting..." : "Enter Raffle for Free"}
        </button>
    }

    if (eligibitlityFetched && !hasEligibility) {
        return <button
            onClick={paidEntry}
            disabled={isFetching}
            className="bg-[#303730] hover:bg-[#677467] text-[#DDF5DD] py-2 px-4 rounded w-full">
            {isFetching ? "Posting..." : "Enter Raffle for 0.0000008Ξ"}
        </button>
    }
};
