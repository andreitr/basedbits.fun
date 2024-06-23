"use server";

import {Header} from "@/app/lib/components/Header";
import {Footer} from "@/app/lib/components/Footer";
import {Raffle} from "@/app/raffle/[id]/components/Raffle";
import {BBitsRaffleABI} from "@/app/lib/abi/BBitsRaffle.abi";
import {readContract} from "@wagmi/core";
import BigNumber from "bignumber.js";
import {createConfig, webSocket} from "wagmi";
import {base} from "wagmi/chains";

interface PageProps {
    params: {
        id: number;
    };
}

async function getRaffleId(id: number) {

    const ethConfig = createConfig({
        chains: [base],
        transports: {
            [base.id]: webSocket(
                `wss://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
            ),
        },
    });

    const raffle = await readContract(ethConfig, {
        abi: BBitsRaffleABI,
        address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
        functionName: "idToRaffle",
        args: [id],
    });

    let [startedAt, settledAt, winner, sponsor] = raffle as [
        BigNumber,
        BigNumber,
        `0x${string}`,
        {
            sponsor: `0x${string}`;
            tokenId: BigNumber;
        },
    ];
    return {startedAt, settledAt, winner, sponsor};
}

export async function generateMetadata({params: {id}}: PageProps) {

    const raffle = await getRaffleId(id);
    const title = `Raffle #${id}`;
    let description = `Raffle for Based Bit #${raffle.sponsor.tokenId}! A Based Bit is raffled off every 24 hours. Check-in to enter for free.`

    const preview = `https://ipfs.raribleuserdata.com/ipfs/QmRqqnZsbMLJGWt8SWjP2ebtzeHtWv5kkz3brbLzY1ShHt/${raffle.sponsor.tokenId}.png`

    return {
        title: title,
        description: description,
        openGraph: {
            images: [
                {
                    url: preview,
                    width: 1200,
                    height: 630,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export default async function Page({params: {id}}: PageProps) {
    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <Header/>
                    <Raffle id={id}/>
                </div>
            </div>

            <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
                <Footer/>
            </div>
        </div>
    );
}
