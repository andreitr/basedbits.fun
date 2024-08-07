import { useEffect, useState } from "react";
import { getEnsName } from "@wagmi/core";

import { truncateAddress } from "@/app/lib/utils/addressUtils";
import Link from "next/link";
import { ethConfig } from "@/app/lib/Web3Configs";

interface RaffleWinnerProps {
  address: `0x${string}`;
}

export const RaffleWinner = ({ address }: RaffleWinnerProps) => {
  const [ensName, setEnsName] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnsName = async () => {
      const name = await getEnsName(ethConfig, { address });
      setEnsName(name);
    };
    fetchEnsName();
  }, [address]);

  return (
    <div className="p-4 bg-[#ABBEAC] rounded-lg text-center">
      <div className="text-xl font-semibold text-[#363E36]">
        <Link href={`/users/${address}`}>
          winner → {ensName || truncateAddress(address)}
        </Link>
      </div>
    </div>
  );
};
