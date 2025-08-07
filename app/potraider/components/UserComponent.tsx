"use client";

import { useUser } from "@/app/lib/hooks/useUser";
import { useAccount } from "wagmi";

export const UserComponent = () => {
  const { address, isConnected } = useAccount();
  const { data: user } = useUser({
    address: address as `0x${string}`,
    enabled: isConnected,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-between rounded-lg gap-2 uppercase">
      <div>🏴‍☠️ PotRaider</div>
      <div>🔥</div>
      <div>Ready to raid!</div>
    </div>
  );
};
