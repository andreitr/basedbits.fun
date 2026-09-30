import { createConfig, http } from "wagmi";
import { base, baseSepolia, mainnet } from "wagmi/chains";

import {
  baseRpcUrl,
  baseTestnetRpcUrl,
  mainnetRpcUrl,
} from "@/app/lib/rpcUrls";

export {
  BASE_CHAIN_ID,
  baseNFTUrl,
  baseRpcUrl,
  baseTestnetRpcUrl,
  mainnetRpcUrl,
} from "@/app/lib/rpcUrls";

export const baseConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(baseRpcUrl),
  },
});

export const ethConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(mainnetRpcUrl),
  },
});

// Testnet config
export const baseSepoliaConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(baseTestnetRpcUrl),
  },
});
