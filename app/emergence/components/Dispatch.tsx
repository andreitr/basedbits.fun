import { DBZeitgeist } from "../../lib/types/types";
import { VT323 } from "next/font/google";

const vt323 = VT323({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
});

interface DispatchProps {
    record: DBZeitgeist;
}

export function Dispatch({ record }: DispatchProps) {
    const date = new Date(record.created_at);
    const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).toUpperCase();

    return (
        <div
            key={record.id}
            className={`bg-black p-8 rounded-lg text-[#00C358] ${vt323.className} w-[400px] h-[400px] flex flex-col justify-center`}
        >
            <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="flex flex-col justify-center text-4xl">
                    {record.headline}
                </div>
                <div className="text-lg text-[#006C31]">{record.lede}</div>
            </div>
            <div className="text-gray-700 text-sm uppercase text-lg text-[#006C31]">
                SIGNAL:{record.signal} EMOTION:{record.emotion} DISPATCH {formattedDate}
            </div>
        </div>
    );
}
