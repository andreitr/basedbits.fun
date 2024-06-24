"use server";

import {Header} from "@/app/lib/components/Header";
import {CheckIn} from "@/app/lib/components/CheckIn";
import {Footer} from "@/app/lib/components/Footer";
import {Social} from "@/app/lib/components/Social";

export default async function Home() {
    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <Header/>
                    {/*<RaffleComponent/>*/}
                </div>
            </div>

            <div className="flex justify-center items-center w-full bg-[#cae2ca] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <CheckIn/>
                </div>
            </div>

            <div className="flex justify-center items-center w-full bg-[#859985] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <Social/>
                </div>
            </div>

            <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
                <Footer/>
            </div>
        </div>
    );
}
