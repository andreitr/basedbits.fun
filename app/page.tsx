"use server";

import {Header} from "@/app/lib/components/Header";
import {CheckIn} from "@/app/lib/components/CheckIn";

export default async function Home() {

    return (
        <>
            <Header/>
            <CheckIn/>
        </>
    );
}