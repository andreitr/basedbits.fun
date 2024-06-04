"use client";
import Link from "next/link";
import Image from "next/image";
import {useEffect, useState} from "react";
import {useAccount, useReadContract} from "wagmi";
import {BBitsSocialABI} from "@/app/lib/abi/BBitsSocial.abi";
import {PostButton} from "@/app/lib/components/PostButton";

export const Social = () => {
    const [message, setMessage] = useState("");
    const [posted, setPosted] = useState(false);

    const urlRegex =
        /\b((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?(\.[a-zA-Z]{2,})?(\.[a-zA-Z]{2,})?(\/[a-zA-Z0-9-._~:\/?#\[\]@$&'()*+,;=]*)?)\b/g;
    const {address, isConnected} = useAccount();

    const {data: characterLimit} = useReadContract({
        abi: BBitsSocialABI,
        address: process.env.NEXT_PUBLIC_BB_SOCIAL_ADDRESS as `0x${string}`,
        functionName: "characterLimit",
        args: [],
        query: {
            enabled: isConnected,
            staleTime: 3600000,
        },
    });

    const {data: isAllowed} = useReadContract({
        abi: BBitsSocialABI,
        address: process.env.NEXT_PUBLIC_BB_SOCIAL_ADDRESS as `0x${string}`,
        functionName: "canPost",
        args: [address],
        query: {
            enabled: isConnected,
            staleTime: 3600000,
        },
    });

    const isAboveLimit =
        characterLimit !== undefined && message.length > (characterLimit as number);
    const hasUrl = urlRegex.test(message);
    const isValid = !isAboveLimit && !hasUrl;

    useEffect(() => {
        if (posted) {
            const timeoutId = setTimeout(() => {
                setMessage("");
                setPosted(false);
            }, 5000);

            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [posted]);

    return (
        <div className="flex justify-between mt-16 sm:flex-row">
            <div className="flex flex-col justify-center mt-8 sm:mt-0">
                <div className="text-4xl font-semibold text-[#080908] mb-4 ">
                    Shill Based Bits!
                </div>
                <div className="text-[#373D37] mb-6">
                    Have a 7-day streak? Post a message to our socials on <Link
                    href="https://warpcast.com/basedbits"
                    target="_blank"
                    className="underline font-semibold"
                >Farcaster</Link> and <Link
                    href="https://x.com/basedbits_fun"
                    target="_blank"
                    className="underline font-semibold"
                >X</Link>!
                </div>
                <textarea
                    className="mt-6 rounded-lg p-2 bg-[#DDF5DD] shadow-sm focus:outline-none"
                    rows={4}
                    placeholder="something based, no links, no spam — or else banhammer!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                {isAboveLimit && (
                    <div className="text-red-200 text-sm mt-2">
                        Slow down, Shakespeare! This message is too long - keep it under{" "}
                        {characterLimit as string} characters.
                    </div>
                )}

                {hasUrl && (
                    <div className="text-yellow-200 text-sm mt-2">
                        Links are not allowed, just words please!
                    </div>
                )}

                {posted && (
                    <div className="mt-4">
                        Posted! Your message will show up on socials in a bit!
                    </div>
                )}

                {Boolean(isAllowed) && isValid && (
                    <div className="mt-4">
                        <PostButton message={message} disabled={posted} onSuccess={() => setPosted(true)}/>
                    </div>
                )}

                {!isConnected && (
                    <div className="text-[#677467] mt-4">connect wallet → post</div>
                )}
            </div>

            <Image
                className="w-auto max-w-72 scale-x-[-1] hidden sm:block"
                src="/images/notepad.png"
                alt="Are you here?"
                width={250}
                height={250}
                priority={true}
            />
        </div>
    );
};
