"use server";

import {getBit98MintById} from "@/app/lib/api/getBit98MintById";
import {fetchRace, getRace} from "@/app/lib/api/baserace/getRace";
import {getRaceCount} from "@/app/lib/api/baserace/getRaceCount";
import {Header} from "@/app/lib/components/client/Header";
import {MintComponent} from "@/app/race/components/MintComponent";
import {Footer} from "@/app/lib/components/Footer";

interface Props {
    params: Promise<{
        id: number;
    }>;
}

export async function generateMetadata(props: Props) {
    const params = await props.params;
    const {id} = params;
    const race = await getRace(Number(id));

    const title = `BaseRace ${id}`;
    const description = `Winner ${race.winner} won ${race.prize}`;

    return {
        title: title,
        description: description,
    };

}

export default async function Page(props: Props) {

    const params = await props.params;
    const {id} = params;


    const race = await getRace(Number(id));

    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <Header/>

                    Our rance is Prize {race.prize} and winner {race.winner}

                    <MintComponent/>
                </div>
            </div>

            <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
                <Footer/>
            </div>
        </div>
    );
}
