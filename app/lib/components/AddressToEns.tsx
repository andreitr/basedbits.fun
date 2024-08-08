import { useEffect, useState } from "react";
import { getEnsName } from "@wagmi/core";

import { truncateAddress } from "@/app/lib/utils/addressUtils";
import { ethConfig } from "@/app/lib/Web3Configs";

interface Props {
  address: `0x${string}`;
}

export const AddressToEns = ({ address }: Props) => {
  const [ensName, setEnsName] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnsName = async () => {
      const name = await getEnsName(ethConfig, { address });
      setEnsName(name);
    };
    fetchEnsName();
  }, [address]);

  return <>{ensName || truncateAddress(address)}</>;
};
