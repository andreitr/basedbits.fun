"use client";

import { truncateAddress } from "@/app/lib/utils/addressUtils";
import { useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";

interface Props {
  address: `0x${string}`;
}

export const ENSName = ({ address }: Props) => {
  const { data: ensName, isSuccess } = useEnsName({
    chainId: mainnet.id,
    address,
  });
  return <>{ensName && isSuccess ? ensName : truncateAddress(address)}</>;
};
