"use client";

import { useState } from "react";
import { TabUser } from "@/app/punks/components/TabUser";
import { TabAll } from "@/app/punks/components/TabAll";

enum TABS {
  USER,
  COLLECTION,
}

export const Tabs = () => {
  const [tab, setTab] = useState<TABS>(TABS.COLLECTION);

  return (
    <div>
      <div className="flex justify-start gap-3">
        <button
          className={`text-white bg-black py-2 px-4 rounded-md ${tab === TABS.USER ? "bg-opacity-30" : "bg-opacity-70"}`}
          onClick={() => setTab(TABS.COLLECTION)}
        >
          View All
        </button>
        <button
          className={`text-white bg-black py-2 px-4 rounded-md ${tab === TABS.COLLECTION ? "bg-opacity-30" : "bg-opacity-70"}`}
          onClick={() => setTab(TABS.USER)}
        >
          Minted By You
        </button>
      </div>
      <div className="mt-5">
        {tab === TABS.USER ? (
          <TabUser contract={process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS!} />
        ) : (
          <TabAll contract={process.env.NEXT_PUBLIC_BURNED_BITS_ADDRESS!} />
        )}
      </div>
    </div>
  );
};
