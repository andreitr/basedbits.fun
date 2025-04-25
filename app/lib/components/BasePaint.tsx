"use client"

import Image from 'next/image';
import { useReadContract } from 'wagmi';
import { BasePaintAbi } from '../abi/BasePaint.abi';
const BASEPAINT_CONTRACT_ADDRESS = '0xBa5e05cb26b78eDa3A2f8e3b3814726305dcAc83';

export const BasePaint = () => {

    const { data: tokenId } = useReadContract({
        abi: BasePaintAbi,
        address: BASEPAINT_CONTRACT_ADDRESS as `0x${string}`,
        functionName: "today",

    });


    return (

        <div className="w-full flex flex-col md:flex-row sm:gap-10 justify-start bg-white text-black rounded-lg p-4">
            {!tokenId ? (
                <div className="rounded-lg w-[120px] h-[120px] bg-gray-100 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
                </div>
            ) : (
                <Image
                    className="rounded-lg w-[120px] h-[120px]"
                    src={`https://basepaint.xyz/api/art/image?day=${Number(tokenId) - 1}`}
                    alt="BasePaint"
                    width="120"
                    height="120"
                />
            )}
            <div className="flex flex-col justify-between">
                <div>
                    <div className="text-2xl font-bold mb-2">Mint BasePaint Burn BBITS</div>
                    <div>
                        When you use our referral link to mint a BasePaint, we burn 100% of referral fees via BBITS. Every mint burns!!!
                    </div>
                </div>
            </div>
        </div>
    )

};
