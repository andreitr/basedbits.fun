export default function Home() {
    return (
        <main className="flex min-h-screen flex-col p-24">
            <div className="text-5xl font-medium text-[#394039]">
                Based Bits
            </div>
            <div className="font-xs flex text-thin flex-row gap-2 mt-2 text-[#829082]">
                <a href="https://rarible.com/BasedBits">Rarible</a>
                <a href="https://opensea.io/collection/based-bits">OpenSea</a>
                <a href="https://warpcast.com/basedbits">Farcaster</a>
                <a href="https://twitter.com/basedbits_fun">Twitter</a>
            </div>
        </main>
    );
}