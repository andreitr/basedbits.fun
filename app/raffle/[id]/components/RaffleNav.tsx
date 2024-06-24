import Link from "next/link";
import Image from "next/image";
import leftArrow from "@/app/lib/icons/arrow-left.svg";
import rightArrow from "@/app/lib/icons/arrow-right.svg";

interface RaffleNavProps {
    id: number;
    hasNext: boolean;
}

export const RaffleNav = ({id, hasNext}: RaffleNavProps) => {

    return <div className="flex flex-row gap-2">

        <div
            className={`bg-white rounded-full p-2 ${id > 1 ? 'cursor-pointer hover:bg-[#ABBEAC] opacity-70' : 'opacity-40'}`}>
            <Link href={id > 1 ? `/raffle/${Number(id) - 1}` : `/raffle/${Number(id)}`}>
                <Image
                    className="w-4"
                    src={leftArrow}
                    alt="Previous Raffle"
                />
            </Link>
        </div>

        <div
            className={`bg-white rounded-full p-2 ${hasNext ? 'cursor-pointer hover:bg-[#ABBEAC] opacity-70' : 'opacity-40'}`}>
            <Link href={hasNext ? `/raffle/${Number(id) + 1}` : `/raffle/${Number(id)}`}><Image
                className="w-4"
                src={rightArrow}
                alt="Next Raffle"
            /></Link>
        </div>
    </div>
}