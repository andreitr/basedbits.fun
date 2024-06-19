"use client";

import {useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {useEffect} from "react";
import {BBitsRaffleABI} from "@/app/lib/abi/BBitsRaffle.abi";
import {useQueryClient} from "@tanstack/react-query";

interface FreeEntryButtonProps {
    id: number;
}

export const EntryButton = ({id}: FreeEntryButtonProps) => {
    const {address, isConnected} = useAccount();
    const queryClient = useQueryClient();

    const {data, writeContract} = useWriteContract();
    const {isFetching, isSuccess} = useWaitForTransactionReceipt({
        hash: data,
    });

    const {data: hasEligibility, isFetched: eligibitlityFetched} = useReadContract({
        abi: BBitsRaffleABI,
        address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
        functionName: "isEligibleForFreeEntry",
        args: [address]
    });


    const {data: hasExistingEntry, isFetched: existingEntryFetched, queryKey} = useReadContract({
        abi: BBitsRaffleABI,
        address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
        functionName: "hasEnteredRaffle",
        args: [id, address],

    });


    useEffect(() => {
        if (isSuccess) {
            queryClient.invalidateQueries({queryKey});
        }
    }, [queryClient, isSuccess]);

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
            value: BigInt(100000000000000),
        });
    }


    if (!eligibitlityFetched) {
        return "Fetching eligibility...";
    }

    if (existingEntryFetched && hasExistingEntry) {
        return <button
            disabled={true}
            className="bg-[#677467] text-[#DDF5DD] py-2 px-4 rounded w-full"
        >
            Entry recorded! Good luck
        </button>
    }

    if (!isConnected) {
        return <div className="text-[#677467] mt-4">connect wallet → enter</div>
    }

    if (eligibitlityFetched && hasEligibility) {
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
            {isFetching ? "Posting..." : "Enter Raffle for 0.0001Ξ"}
        </button>
    }
};
