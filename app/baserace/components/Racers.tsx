"use client";

import {useState, useEffect} from "react";
import {Racer} from "@/app/baserace/components/Racer";

interface Props {
    count: number;
    eliminated: number;
}

export const Racers = ({count, eliminated}: Props) => {
    const [racers, setRacers] = useState(
        Array.from({length: count})
            .map((_, index) => index)
    );
    const [isAnimating, setIsAnimating] = useState(false);


    const handleClick = (idx: number) => {

        setRacers((prevRacers) => {
            const newRacers = [...prevRacers];
            const [clickedItem] = newRacers.splice(idx, 1);
            newRacers.unshift(clickedItem);
            return newRacers;
        });
    };

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
                {racers.map((index, i) => (
                    <Racer
                        key={index}
                        tokenId={index}
                        idx={i}
                        popped={0 === i}
                        eliminated={i > eliminated}
                        onClick={handleClick}/>
                ))}
            </div>
        </div>
    );
};
