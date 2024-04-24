import Image from "next/image";
import Link from "next/link";

export default async function Home() {

    return (
        <main className="flex justify-center mt-20 gap-10">
            <div className="flex flex-col items-center">
                <Image src={'/images/developer.png'} alt={'based bits'} width={200} height={200}/>
            </div>
            {/*<w3m-button/>*/}
            <div className="flex items-center justify-center">
                <div className="flex-col bg-white p-5">
                    <div className="mb-2">Based Bits</div>
                    <div className="text-sm">
                        <Link href="https://opensea.io/collection/based-bits" target="_blank">
                            https://opensea.io/collection/based-bits
                        </Link>
                    </div>
                    <div className="text-sm">
                        <Link href="https://rarible.com/BasedBits" target="_blank">
                            https://rarible.com/BasedBits
                        </Link>
                    </div>
                    <div className="text-sm">
                        <Link href="https://warpcast.com/basedbits" target="_blank">
                            https://warpcast.com/basedbits
                        </Link>
                    </div>
                    <div className="text-sm">
                        <Link href="https://x.com/basedbits_fun" target="_blank">
                            https://x.com/basedbits_fun
                        </Link>
                    </div>
                </div>

            </div>
        </main>
    );
}