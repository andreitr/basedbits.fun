"use client";

import { ConnectKitButton } from "connectkit";

export const Header = () => {
  return (
    <div className="flex flex-row py-6 text-right justify-between">
      <div className="bg-green-400 rounded-lg px-6 py-2 bg-[#c4dac4]">⌐⊡-⊡</div>
      <ConnectKitButton />
    </div>
  );
};
