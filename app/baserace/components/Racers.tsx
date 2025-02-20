"use client";

import {useEffect, useState} from "react";
import {Racer} from "@/app/baserace/components/Racer";

interface Props {
    entries: number[];
    eliminated: number;
    onClick: (idx: number) => void;
}

export const Racers = ({entries, onClick, eliminated}: Props) => {

    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isAnimating) {
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 500); // Match the duration of the CSS transition
            return () => clearTimeout(timer);
        }
    }, [isAnimating]);

    return (
        <div>
            <div className="flex flex-wrap">
                {entries.map((index, i) => (
                    <Racer
                        key={index}
                        tokenId={index}
                        idx={i}
                        popped={0 === i}
                        eliminated={i > eliminated}
                        onClick={onClick}
                    />
                ))}
            </div>
        </div>
    );
};
