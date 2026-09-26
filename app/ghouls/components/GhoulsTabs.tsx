"use client";

import { GhoulsNFTList } from "@/app/ghouls/components/GhoulsNFTList";
import { TabDrawing } from "@/app/ghouls/components/TabDrawing";
import { TabStats } from "@/app/ghouls/components/TabStats";
import { useState } from "react";

enum TABS {
  MY_GHOULS,
  DRAWING,
  STATS,
}

const TAB_LABELS: Record<TABS, string> = {
  [TABS.MY_GHOULS]: "My Ghouls",
  [TABS.DRAWING]: "Drawing",
  [TABS.STATS]: "Stats",
};

export const GhoulsTabs = () => {
  const [tab, setTab] = useState<TABS>(TABS.MY_GHOULS);

  return (
    <div>
      <div className="flex justify-start gap-3">
        {[TABS.MY_GHOULS, TABS.DRAWING, TABS.STATS].map((t) => (
          <button
            key={t}
            className={`text-white bg-black py-2 px-4 rounded-md ${tab === t ? "bg-opacity-70" : "bg-opacity-30"}`}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {tab === TABS.MY_GHOULS ? (
          <GhoulsNFTList />
        ) : tab === TABS.DRAWING ? (
          <TabDrawing />
        ) : (
          <TabStats />
        )}
      </div>
    </div>
  );
};
