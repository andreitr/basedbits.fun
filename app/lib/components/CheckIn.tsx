"use client";

import Image from "next/image";
import {MyStreak} from "@/app/lib/components/MyStreak";

export const CheckIn = () => {

    return <div className="flex justify-evenly mt-8">

        <Image className="w-auto" src='/images/developer.png' alt='Are you here?' width={200}
               height={200}
               priority={true}/>

        <div className="flex flex-col justify-center">
            <div className="text-6xl font-bold mb-2">Are you here?</div>
            <div className="text-gray-600"><p>Based Bits holder - it is time to check-in into the home base!</p>
            </div>

            <div className="mt-8">
                <MyStreak/>
            </div>
        </div>
    </div>
}