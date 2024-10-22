"use server";

import {Header} from "@/app/lib/components/client/Header";
import {Footer} from "@/app/lib/components/Footer";
import Image from "next/image";
import {MintedList} from "@/app/burn/components/MintedList";

export default async function Page() {
    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <Header/>
                    <div
                        className="w-full flex flex-row gap-20 justify-between bg-black bg-opacity-90 text-white rounded-lg p-10">
                        <div>
                            <div className="text-5xl mb-2">Burned Bits</div>
                            <div>Every mint burns a Based Bit. The mint prince is calculated based on the BBITS token.
                            </div>
                            <div className="mt-6">
                                <div>Mint Price: 0.005E</div>
                            </div>
                            <div className="flex flex-row mt-6 gap-6">
                                <div className="bg-red-800 p-4 rounded-lg">Mint with ETH</div>
                                <div className="bg-red-800 p-4 rounded-lg">Mint with BBITS</div>
                            </div>
                        </div>

                        <div>
                            <Image className="rounded-lg"
                                   src={"/images/burnedbit.avif"}
                                   alt="Preview"
                                   width="350"
                                   height="350"/>
                        </div>
                    </div>
                    <div>Minted 345</div>
                    <MintedList/>
                </div>
            </div>

            <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
                <Footer/>
            </div>
        </div>
    );
}
