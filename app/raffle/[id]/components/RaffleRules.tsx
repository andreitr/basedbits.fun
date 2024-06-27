import Link from "next/link";
import {Raffle} from "@/app/lib/types/types";

interface RaffleRulesProps {
    raffle: Raffle;
}

export const RaffleRules = ({raffle}: RaffleRulesProps) => {
    return (
        <div className="mt-10 text-[#677467]">
            <div className="mb-3">
                Here is how to win{" "}
                <Link
                    className="mt-2 font-semibold hover:underline"
                    target="_blank"
                    href={`https://opensea.io/assets/base/0x617978b8af11570c2dab7c39163a8bde1d282407/${raffle.sponsor.tokenId}`}
                >{`Based Bit #${raffle.sponsor.tokenId}`}</Link>
            </div>
            <div className="text-sm">
                <span className="mt-2 font-semibold">Free Entry</span>: A Based Bit NFT
                + Recent Check-in
            </div>
            <div className="text-sm">
                <span className="font-semibold">Paid Entry</span>: A tiny fee of 0.0001Ξ
                to discourage bots
            </div>
        </div>
    );
};
