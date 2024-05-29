"use server";

import {Header} from "@/app/lib/components/Header";
import {CheckIn} from "@/app/lib/components/CheckIn";
import {Footer} from "@/app/lib/components/Footer";
import Image from "next/image";

export default async function Home() {
    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <Header/>
                    <CheckIn/>
                </div>
            </div>

            <div className="flex justify-center items-center w-full bg-[#96A896] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <div className="flex flex-col justify-between mt-8 sm:flex-row">
                        <div className="flex flex-col justify-center mt-8 sm:mt-0 sm:ml-4">
                            <div className="text-4xl font-semibold text-black mb-4">
                                Shill Based Bits!
                            </div>
                            <div className="text-white mb-6">
                                Srly. Post something cool and your record will live onchain.
                            </div>


                            <textarea className="rounded-lg p-2 bg-[#DDF5DD]" rows={3} placeholder="type here"></textarea>
                            <div className="text-sm mt-2">only 140 characters. no links. spammers banned</div>
                        </div>
                        <Image
                            className="w-auto max-w-72 m-auto scale-x-[-1]"
                            src="/images/developer.png"
                            alt="Are you here?"
                            width={250}
                            height={250}
                            priority={true}
                        />


                    </div>
                </div>
            </div>

            <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
                <Footer/>
            </div>
        </div>
    );
}
