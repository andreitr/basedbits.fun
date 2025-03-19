"use client";

import { Racer } from "@/app/baserace/components/Racer";
import { BaseRace, BaseRaceEntry } from "@/app/lib/types/types";

interface Props {
  entries: BaseRaceEntry[];
  eliminated?: number;
  race: BaseRace;
  userEntries?: BaseRaceEntry[];
}

export const Racers = ({
  entries,
  eliminated = 0,
  race,
  userEntries = [],
}: Props) => {
  return (
    <div className="flex flex-wrap">
      {entries.map((entry, i) => {
        const isUser = userEntries.some(
          (userEntry) => userEntry.tokenId === entry.tokenId,
        );

        return (
          <Racer
            key={i}
            tokenId={entry.tokenId}
            race={race}
            eliminated={i < entries.length - eliminated}
            isUserRacer={isUser}
          />
        );
      })}
    </div>
  );
};
