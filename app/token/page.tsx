import {Header} from "@/app/lib/components/Header";
import {Footer} from "@/app/lib/components/Footer";
import {getTokenTotalSupply} from "@/app/lib/api/getTokenTotalSupply";
import {getTokenNFTCount} from "@/app/lib/api/getTokenNFTCount";
import {formatUnits} from "ethers";

export default async function Page() {

    const tokens = await getTokenTotalSupply();
    const count = await getTokenNFTCount();

    return (
        <div className="flex flex-col justify-center items-center w-full">
            <div className="flex justify-center items-center w-full bg-[#DDF5DD] px-10 lg:px-0 pb-8 sm:pb-0">
                <div className="container max-w-screen-lg">
                    <Header/>
                    <div className="mb-20">
                        <div className="text-4xl mb-2">{formatUnits(tokens)} $BITS backed by {count} Based Bits</div>
                        <div>1 Based Bit = 1024 $BBITS</div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center items-center w-full px-10 lg:px-0 mt-16 mb-24">
                <Footer/>
            </div>
        </div>
    );
}
