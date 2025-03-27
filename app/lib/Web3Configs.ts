import { createConfig, http } from "wagmi";
import { base, baseSepolia, mainnet } from "wagmi/chains";
import { JsonRpcProvider } from "ethers";

export const mainnetRpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;
export const baseRpcUrl = `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;
export const baseTestnetRpcUrl = `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;
export const baseNFTUrl = `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;

export const baseProvider = new JsonRpcProvider(baseRpcUrl);

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
