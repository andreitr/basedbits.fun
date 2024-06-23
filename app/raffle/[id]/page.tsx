"use server";

import {Header} from "@/app/lib/components/Header";
import {Footer} from "@/app/lib/components/Footer";
import {Raffle} from "@/app/raffle/[id]/components/Raffle";


interface PageProps {
    params: {
        id: number;
    };
}

export async function generateMetadata({params: {id}}: PageProps) {

    const title = `Based Bits Raffle #${id}`;
    const description = "A Based Bit NFT is raffled off to a lucky winner every 24 hours."
    const preview = `https://ipfs.raribleuserdata.com/ipfs/QmRqqnZsbMLJGWt8SWjP2ebtzeHtWv5kkz3brbLzY1ShHt/0.png`

    // const preview = `/api/images/og/proposals?title=${encodeURIComponent(
    //     title
    // )}&description=${encodeURIComponent(description)}`;

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
