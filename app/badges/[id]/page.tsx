"use server";

import {Header} from "@/app/lib/components/Header";
import {BadgeDetails} from "@/app/badges/[id]/components/BadgeDetails";
import {Footer} from "@/app/lib/components/Footer";

interface UserProps {
    params: {
        id: number

    }
}

export default async function Badge({params: {id}}: UserProps) {

    return <div className="flex flex-col justify-center items-center w-full">
        <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
            <div className="container max-w-screen-lg">
                <Header/>
                <BadgeDetails id={id}/>
            </div>
        </div>


        <Footer/>
        <div>Holders..</div>

    </div>
}