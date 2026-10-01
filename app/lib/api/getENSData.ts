import { mainnetRpcUrl } from "@/app/lib/Web3Configs";
import { ethers, isError } from "ethers";

const provider = new ethers.JsonRpcProvider(mainnetRpcUrl);

export interface ENSData {
  ensName: string | null;
  ensAvatar: string | null;
  // True when the lookup itself failed (RPC error, timeout), as opposed to the
  // address simply having no verifiable primary name.
  failed: boolean;
}

async function lookupName(address: string): Promise<string | null> {
  try {
    return await provider.lookupAddress(address);
  } catch (error) {
    // Off-chain (CCIP-Read) names whose gateway can't confirm the forward
    // record, e.g. *.degen.eth returning 404. The name is unverifiable, which
    // is the same as having no primary name.
    if (isError(error, "OFFCHAIN_FAULT")) {
      return null;
    }
    throw error;
  }
}

async function lookupAvatar(ensName: string): Promise<string | null> {
  try {
    const resolver = await provider.getResolver(ensName);
    if (!resolver) {
      return null;
    }
    return (await resolver.getAvatar()) || null;
  } catch {
    return null;
  }
}

export async function getENSData(address: string): Promise<ENSData> {
  try {
    const ensName = await lookupName(address);
    if (!ensName) {
      return { ensName: null, ensAvatar: null, failed: false };
    }

    const ensAvatar = await lookupAvatar(ensName);
    return { ensName, ensAvatar, failed: false };
  } catch (error) {
    const { code, shortMessage, message } = error as {
      code?: string;
      shortMessage?: string;
      message?: string;
    };
    console.warn(
      `ENS lookup failed for ${address}: ${code ?? "ERROR"} ${shortMessage ?? message}`,
    );
    return { ensName: null, ensAvatar: null, failed: true };
  }
}
