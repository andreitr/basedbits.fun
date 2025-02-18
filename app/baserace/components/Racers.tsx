"use client";

import { useState, useEffect } from "react";

interface Props {
  count: number;
  eliminated: number;
}

export const Racers = ({ count, eliminated }: Props) => {
  const [racers, setRacers] = useState(
    Array.from({ length: count })
      .map((_, index) => index)
      .reverse(),
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const handleShuffle = () => {
    setIsAnimating(true);
    setRacers((prevRacers) => {
      const newRacers = [...prevRacers];
      const lastItem = newRacers.pop();
      if (lastItem !== undefined) {
        newRacers.unshift(lastItem);
      }
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
      <div onClick={handleShuffle} className="cursor-pointer mb-4">
        MOVE LAST TO FIRST
      </div>

      <div className="flex flex-wrap gap-2">
        {racers.map((index, i) => (
          <div
            key={index}
            className={`flex items-center justify-center w-10 h-10 rounded-full bg-black text-white transition-opacity duration-500 ${isAnimating && i === 0 ? "opacity-100" : ""} ${isAnimating && i === racers.length - 1 ? "opacity-0" : ""} ${eliminated < index ? "opacity-50" : ""}`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};
