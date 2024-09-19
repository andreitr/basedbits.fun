"use client";

import {Mint} from "@/app/lib/types/types";
import {useAccount, useReadContract} from "wagmi";
import {Bit98ABI} from "@/app/lib/abi/Bit98.abi";
import {baseSepoliaConfig} from "@/app/lib/Web3Configs";
import {baseSepolia} from "wagmi/chains";

interface Props {
    mint: Mint;
}

export const MintEntries = ({mint}: Props) => {
    const {isConnected, address} = useAccount();

    const {data: totalEntries, isFetched: hasTotalEntries} = useReadContract({
        abi: Bit98ABI,
        address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
        functionName: "totalEntries",
        // TODO: Remove config and chain id in prod
        config: baseSepoliaConfig,
        chainId: baseSepolia.id,
        args: [BigInt(Number(mint.tokenId))],
    });

    const {data: userEntries, isFetched: hasUserEntries} = useReadContract({
        abi: Bit98ABI,
        address: process.env.NEXT_PUBLIC_BB_BIT98_ADDRESS as `0x${string}`,
        // TODO: Remove config and chain id in prod
        config: baseSepoliaConfig,
        chainId: baseSepolia.id,
        functionName: "userEntryByAddress",
        args: [[BigInt(Number(mint.tokenId))], address],
        query: {
            enabled: isConnected,
        },
    });

    if (!isConnected && hasTotalEntries) {
        return (
            <>
                There are <span className="font-semibold">{String(totalEntries)}</span>{" "}
                raffle entries.
            </>
        );
    }

    if (hasUserEntries && hasTotalEntries) {
        return (
            <>
                You hold <span className="font-semibold">{String(userEntries)}</span>{" "}
                out of <span className="font-semibold">{String(totalEntries)}</span>{" "}
                total raffle entries.
            </>
        );
    }

    return <>Loading raffle entries for this mint...</>;
};
