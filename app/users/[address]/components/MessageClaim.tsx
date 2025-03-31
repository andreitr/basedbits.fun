"use client";

import { useMessage } from "@/app/lib/hooks/messages/useMessage";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const MessageClaim = () => {

    const searchParams = useSearchParams();
    const messageHash = searchParams.get("airdrop");

    const { data: message } = useMessage(messageHash ? messageHash.toString() : undefined);



    useEffect(() => {
        if (message) {
            if (message.opened_at) {
                console.log(`Airdrop already claimed for ${message.bounty}`);
            } else {
                console.log("Airdrop not claimed");
            }
        }
    }, [message]);

    return <div>MessageClaim {messageHash}</div>;
};
