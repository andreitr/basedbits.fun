"use client";

import { useEffect, useState } from "react";
import { Racer } from "@/app/baserace/components/Racer";
import { BaseRaceEntry } from "@/app/lib/types/types";

interface Props {
  entries: BaseRaceEntry[];
  eliminated: number;
  onClick: (idx: number) => void;
}

export const Racers = ({ entries, onClick, eliminated }: Props) => {
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
        {entries.map((entry, i) => (
          <Racer
            key={i}
            tokenId={entry.tokenId}
            eliminated={entry.index > eliminated}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  );
};
