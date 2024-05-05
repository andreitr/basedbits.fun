"use server";

import Image from "next/image";
import {MyStreak} from "@/app/lib/components/MyStreak";

export default async function Home() {

    return (
        <div className="flex gap-16 justify-center mt-16">

            <Image src={'/images/developer.png'} alt={'based bits'} width={200} height={200}/>
            <div className="flex flex-col justify-center gap-3">
                <div className="text-5xl font-bold">Are you here?</div>
                <div className="text-gray-600">check into Based Bits to mark your presence</div>

                <div className="mt-8"><MyStreak /></div>
            </div>
        </div>
    );
}