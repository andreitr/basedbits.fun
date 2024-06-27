"use server";

import {Header} from "@/app/lib/components/Header";
import {Footer} from "@/app/lib/components/Footer";
import {RaffleComponent} from "@/app/raffle/[id]/components/RaffleComponent";
import {getRaffleById} from "@/app/lib/api/getRaffleById";
import {revalidatePath} from "next/cache";
import {getCurrentRaffleId} from "@/app/lib/api/getCurrentRaffleId";


export async function generateMetadata() {
    const raffleId = await getCurrentRaffleId();
    const raffle = await getRaffleById(raffleId);
    const title = `Raffle for Based Bit #${raffle.sponsor.tokenId}`;
    let description = `Raffle for Based Bit #${raffle.sponsor.tokenId}! A Based Bit is raffled off every 24 hours. Check-in to enter for free.`;
    const preview = `https://ipfs.raribleuserdata.com/ipfs/QmRqqnZsbMLJGWt8SWjP2ebtzeHtWv5kkz3brbLzY1ShHt/${raffle.sponsor.tokenId}.png`;

    return {
        title: title,
        description: description,
        openGraph: {
            images: [
                {
                    url: preview,
                    width: 1200,
                    height: 1200,
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

export default async function Page() {
    const raffleId = await getCurrentRaffleId();
    const raffle = await getRaffleById(raffleId);

    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <Header/>
                    <RaffleComponent
                        id={raffleId}
                        raffle={raffle}
                        revalidate={async () => {
                            "use server";
                            revalidatePath(`/raffle/${raffleId}`, "page");
                        }}
                    />
                </div>
            </div>

            <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
                <Footer/>
            </div>
        </div>
    );
}
