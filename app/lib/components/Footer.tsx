import Link from "next/link";

export const Footer = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mt-16 text-[#677467]">
            <div>
                <div className="text-xl text-[#363E36] mb-2">
                    NFT Marketplaces
                </div>
                <div>
                    <Link
                        className="hover:underline text-sm"
                        href="https://rarible.com/BasedBits/items"
                        target="_blank"
                    >
                        Rarible
                    </Link>
                </div>
                <div>
                    <Link
                        className="hover:underline text-sm"
                        href="https://opensea.io/collection/based-bits"
                        target="_blank"
                    >
                        OpenSea
                    </Link>
                </div>
            </div>
            <div>
                <div className="text-xl text-[#363E36] mb-2">Socials</div>
                <div>
                    <Link
                        className="hover:underline text-sm"
                        href="https://warpcast.com/basedbits"
                        target="_blank"
                    >
                        @basedbits on warpcast
                    </Link>
                </div>
                <div>
                    <Link
                        className="hover:underline text-sm"
                        href="https://x.com/andreitr"
                        target="_blank"
                    >
                        @basedbits_fun on x
                    </Link>
                </div>
            </div>

            <div>
                <div className="text-xl text-[#363E36] mb-2">Code</div>
                <div>
                    <Link
                        className="hover:underline text-sm"
                        href="https://basescan.org/address/0xe842537260634175891925f058498f9099c102eb"
                        target="_blank"
                    >
                        Check-in Contract
                    </Link>
                </div>
                <div>
                    <Link
                        className="hover:underline text-sm"
                        href="https://basescan.org/address/0xe0e68930a8cc0c066bb96183870c9949f5396ea8"
                        target="_blank"
                    >
                        Social Contract
                    </Link>
                </div>
                <div>
                    <Link
                        className="hover:underline text-sm"
                        href="https://basescan.org/address/0x617978b8af11570c2dab7c39163a8bde1d282407"
                        target="_blank"
                    >
                        NFT Contract
                    </Link>
                </div>
            </div>
        </div>
    );
};
