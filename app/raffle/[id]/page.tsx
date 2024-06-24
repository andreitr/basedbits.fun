"use server";

import {Header} from "@/app/lib/components/Header";
import {Footer} from "@/app/lib/components/Footer";
import {RaffleComponent} from "@/app/raffle/[id]/components/RaffleComponent";
import {BBitsRaffleABI} from "@/app/lib/abi/BBitsRaffle.abi";
import {readContract} from "@wagmi/core";
import {createConfig, webSocket} from "wagmi";
import {base} from "wagmi/chains";
import {type Raffle} from "@/app/lib/types/types";

interface PageProps {
    params: {
        id: number;
    };
}

async function getRaffleById(id: number) {

    const ethConfig = createConfig({
        chains: [base],
        transports: {
            [base.id]: webSocket(
                `wss://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
            ),
        },
    });

    const data: any = await readContract(ethConfig, {
        abi: BBitsRaffleABI,
        address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
        functionName: "idToRaffle",
        args: [id],
    });

    const raffle: Raffle = {
        startedAt: data[0],
        settledAt: data[1],
        winner: data[2],
        sponsor: {...data[3]}
    }

    return raffle;
}

export async function generateMetadata({params: {id}}: PageProps) {

    const raffle = await getRaffleById(id);
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

    const raffle = await getRaffleById(id);

    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <Header/>
                    <RaffleComponent id={id} raffle={raffle}/>
                </div>
            </div>

            <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
                <Footer/>
            </div>
        </div>
    );
}
