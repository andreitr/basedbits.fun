import { mainnetRpcUrl } from "@/app/lib/Web3Configs";
import { ethers } from "ethers";

export async function getENSData(address: string) {
  try {
    const provider = new ethers.JsonRpcProvider(mainnetRpcUrl);
    const ensName = await provider.lookupAddress(address);

    if (!ensName) {
      return {
        ensName: null,
        ensAvatar: null,
      };
    }
    const resolver = await provider.getResolver(ensName);
    if (!resolver) {
      return {
        ensName,
        ensAvatar: null,
      };
    }

    const ensAvatar = await resolver.getAvatar();

    return {
      ensName,
      ensAvatar: ensAvatar || null,
    };
  } catch (error) {
    console.error("Error fetching ENS data:", error);
    return {
      ensName: null,
      ensAvatar: null,
    };
  }
}
