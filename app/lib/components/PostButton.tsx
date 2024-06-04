"use client";

import {useWaitForTransactionReceipt, useWriteContract} from "wagmi";

import {useEffect} from "react";
import {BBitsSocialABI} from "@/app/lib/abi/BBitsSocial.abi";

interface PostButtonProps {
    disabled: boolean;
    message: string;
    onSuccess?: () => void;
}

export const PostButton = ({disabled, message, onSuccess}: PostButtonProps) => {
    const {data, writeContract} = useWriteContract();
    const {isFetching, isSuccess} = useWaitForTransactionReceipt({
        hash: data,
    });

    useEffect(() => {
        if (isSuccess && onSuccess) {
            onSuccess();
        }
    }, [isSuccess, onSuccess]);

    const post = () => {
        writeContract({
            abi: BBitsSocialABI,
            address: process.env.NEXT_PUBLIC_BB_SOCIAL_ADDRESS as `0x${string}`,
            functionName: "post",
            args: [message],
        });
    };

    return (
        <>
            <button
                onClick={post}
                disabled={isFetching || disabled}
                className={`${disabled ? `bg-[#677467]` : `bg-[#303730]`} hover:bg-[#677467] text-[#DDF5DD] py-2 px-4 rounded w-full`}
            >
                {isFetching ? "Posting..." : "Post to BASE and Socials"}
            </button>
        </>
    );
};
