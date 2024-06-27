import {useReadContract} from "wagmi";
import {BBitsRaffleABI} from "@/app/lib/abi/BBitsRaffle.abi";

interface RaffleEntriesProps {
    id: number;
}

export const RaffleEntries = ({id}: RaffleEntriesProps) => {
    const {data, isFetched} = useReadContract({
        abi: BBitsRaffleABI,
        address: process.env.NEXT_PUBLIC_BB_RAFFLE_ADDRESS as `0x${string}`,
        functionName: "getRaffleEntryNumber",
        args: [id],
    });

    return (
        <div className="flex flex-col">
            <div className="text-md text-[#677467]">Entries</div>
            <div className="text-3xl font-semibold text-[#363E36]">
                {isFetched && data ? data.toString() : ""}
            </div>
        </div>
    );
};
