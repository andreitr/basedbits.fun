"use client";

import {useGetOwnerNFTs} from "@/app/lib/hooks/useGetOwnerNFTs";
import {useEffect, useState} from "react";
import {AlchemyToken} from "@/app/lib/types/alchemy";
import Link from "next/link";

interface Props {
    address: `0x${string}` | undefined;
}

const PAGE_SIZE = 420;

export const NFTList = ({address}: Props) => {
    const [tokens, setTokens] = useState<AlchemyToken[]>([]);

    const {data: based, isLoading} = useGetOwnerNFTs({
        contract: process.env.NEXT_PUBLIC_BB_NFT_ADDRESS!,
        address: address,
        size: PAGE_SIZE,
    });

    const {data: burned} = useGetOwnerNFTs({
        contract: process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS!,
        address: address,
        size: PAGE_SIZE,
    });

    const {data: punks} = useGetOwnerNFTs({
        contract: process.env.NEXT_PUBLIC_PUNKALOT_ADDRESS!,
        address: address,
        size: PAGE_SIZE,
    });

    useEffect(() => {
        if (burned && based && punks) {
            setTokens((prevState) => {
                const newTokens = [
                    ...burned.ownedNfts,
                    ...punks.ownedNfts,
                    ...based.ownedNfts,
                ].filter(
                    (nft) =>
                        !prevState.some(
                            (existingNft) => existingNft.tokenId === nft.tokenId,
                        ),
                );
                return [...prevState, ...newTokens];
            });
        }
    }, [based, burned, punks]);

    if (isLoading || !tokens) {
        return "Loading user NFTs...";
    }

    return (
        <div>
            <div className="grid justify-items-stretch gap-4 lg:grid-cols-5 grid-cols-2">
                {tokens.map((nft, index) => {
                    return (
                        <div
                            key={index}
                            className="flex flex-col bg-[#ABBEAC] p-2 rounded-md items-center justify-center"
                        >
                            <div
                                className="bg-cover bg-center bg-no-repeat lg:w-[175px] lg:h-[175px] w-[115px] h-[115px] rounded-lg"
                                style={{backgroundImage: `url(${nft.image.originalUrl})`}}
                            ></div>
                            <div className="mt-2">
                                <Link
                                    href={`https://opensea.io/assets/base/${nft.contract.address}/${nft.tokenId}`}
                                    target="_blank"
                                    className="hover:underline"
                                >
                                    {nft.name}
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
