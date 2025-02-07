"use server";

import {Header} from "@/app/lib/components/client/Header";
import {CheckInComponent} from "@/app/lib/components/CheckInComponent";
import {Footer} from "@/app/lib/components/Footer";
import {FeatureCard} from "@/app/lib/components/FeatureCard";
import {MintComponent} from "@/app/burn/components/MintComponent";
import {revalidatePath} from "next/cache";
import {getRecentCheckIns} from "@/app/lib/api/getRecentCheckIns";
import {AirdropTimer} from "@/app/lib/components/client/AirdropTimer";
import {ClientWrapper} from "@/app/lib/components/ClientWrapper";
import {UserList} from "@/app/lib/components/client/UserList";
import {getRecentCheckInsLegacy} from "@/app/lib/api/getRecentCheckInsLegacy";

export default async function Home() {

    const new_checkins = await getRecentCheckIns();
    const legacy_checkins = await getRecentCheckInsLegacy();
    const checkins = [...new_checkins, ...legacy_checkins];

    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <Header/>
                    <CheckInComponent checkins={checkins}/>
                </div>
            </div>

            <div className="flex justify-center items-center text-white bg-black w-full lg:px-0 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <div
                        className="flex md:flex-row flex-col md:py-2 py-4 px-10 md:px-0 justify-between items-center w-full gap-4">
                        <FeatureCard
                            title="Burned Bits"
                            description="Minting now"
                            image={"/images/burnedbit.svg"}
                            link="/burn"
                        />
                        <FeatureCard
                            title="Punkalot"
                            description="Sold out"
                            image={"/images/punkalot.svg"}
                            style={"rounded-lg"}
                            link="/punks"
                        />
                        <FeatureCard
                            title="Base Race"
                            description="Coming soon"
                            image={"/images/race.svg"}
                            style={"bg-[#0052FF] w-[80px] h-[80px] rounded-lg"}
                            link="/race"
                        />
                        <FeatureCard
                            title="Swap tokens"
                            description="NFTs → BBITS"
                            image="/images/icon.png"
                            link="/token"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-center items-center w-full pt-10 px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg mb-10">
                    <MintComponent
                        revalidate={async () => {
                            "use server";
                            revalidatePath(`/`, "layout");
                        }}
                    />
                </div>
            </div>

            <div className="flex justify-center items-center w-full bg-[#859985] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg mb-10 mt-10">
                    <div className="text-5xl font-semibold text-[#080908] mb-4">
                        Next Airdrop in <AirdropTimer/>
                    </div>
                    <div>
                        The daily BBITS allocation is evenly distributed among all active,
                        checked-in wallets. Being active in this community literally pays!{" "}
                        <span className={"font-semibold"}>
              {" "}
                            {checkins.length} Based Bits
            </span>{" "}
                        users are here!
                    </div>
                    <div className="mt-4">
                        <ClientWrapper>
                            <UserList users={checkins}/>
                        </ClientWrapper>
                    </div>
                </div>
            </div>

            <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
                <Footer/>
            </div>
        </div>
    );
}
