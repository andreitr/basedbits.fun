"use server";


import {Header} from "@/app/lib/components/Header";
import {UserSummary} from "@/app/users/[address]/components/UserSummary";

interface UserProps {
    params: {
        address: string
    }
}

export default async function User({params:{address}}: UserProps) {

    return <div className="flex flex-col justify-center items-center w-full">
        <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
            <div className="container max-w-screen-lg">
                <Header/>
                <UserSummary address={address}/>
            </div>
        </div>
    </div>
}