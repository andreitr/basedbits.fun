"use client";

import { ConnectKitButton } from "connectkit";

export const Header = () => {
  return (
    <div className="flex flex-row py-3 md:py-6 text-right justify-between">
      <div></div>
      <ConnectKitButton />
    </div>
  );
};
