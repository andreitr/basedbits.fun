"use server";

import Image from "next/image";
import {MyStreak} from "@/app/lib/components/MyStreak";
import {CheckInButton} from "@/app/lib/components/CheckInButton";

export default async function Home() {

    return (
        <div className="flex justify-center mt-16">

            <Image className="w-auto mr-[100px]" src='/images/developer.png' alt='Are you here?' width={200} height={200}
                   priority={true}/>
            <div className="flex flex-col justify-center gap-3">
                <div className="text-7xl font-bold mb-2">Are you here?</div>
                <div className="text-gray-600"><p>Based Bits holder - it is time to check into the home base!</p>
                    <p>Daily check-ins earn streaks ;)</p>
                </div>

                <div className="mt-8">
                    <MyStreak/>
                </div>
                <div className="mt-5">
                    <CheckInButton/>
                </div>
            </div>
        </div>
    );
}