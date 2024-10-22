import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {AlchemyCollectionResponse, type AlchemyUserResponse} from "@/app/lib/types/alchemy";

interface Props {
    address: string | undefined;
    pageKey?: string;
    size: number;
}

export const queryKey = (
    address: string | undefined,
    pageKey: string | undefined,
) => `${address}/nfts?pageKey=${pageKey}`;

export const useGetNFTs = ({address, pageKey, size}: Props) => {
    return useQuery({
        queryKey: [queryKey(address, pageKey)],
        queryFn: async (): Promise<AlchemyCollectionResponse> => {
            const response = await fetch(
                `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}/getNFTsForCollection?contractAddress=${address}&withMetadata=true&pageSize=${size}&pageKey=${pageKey}`,
            );
            return await response.json();
        },
        placeholderData: keepPreviousData,
        enabled: !!address,
    });
};
