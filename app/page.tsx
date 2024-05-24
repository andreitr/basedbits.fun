"use server";

import {Header} from "@/app/lib/components/Header";
import {CheckIn} from "@/app/lib/components/CheckIn";
import {Footer} from "@/app/lib/components/Footer";

export default async function Home() {
    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <Header/>
                    <CheckIn/>
                </div>
            </div>

            <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
                <div className="container max-w-screen-lg">
                    <div className="text-5xl text-[#363E36] mb-4">Based Bits</div>
                    <div className="text-[#677467]">
                        8000 Based Bits causing byte-sized mischief on the BASE chain, a
                        nerdy collection by {" "}
                        <a
                            href="https://warpcast.com/andreitr"
                            target="_blank"
                            title="andreitr.eth on Farcaster"
                        >
                            andreitr.eth
                        </a>
                        {" "}and{" "}
                        <a
                            href="https://warpcast.com/gretagremplin"
                            target="_blank"
                            title="gretagremplin on Farcaster"
                        >
                            gretagremplin.eth
                        </a>
                        . All art is CC0.
                    </div>

                    <Footer/>
                </div>
            </div>
        </div>
    );
}
