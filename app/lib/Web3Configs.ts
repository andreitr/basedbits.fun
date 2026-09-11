import { createConfig, http } from "wagmi";
import { base, baseSepolia, mainnet } from "wagmi/chains";
import { FetchRequest, JsonRpcProvider, Network } from "ethers";

export const mainnetRpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;
export const baseRpcUrl = `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;
export const baseTestnetRpcUrl = `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;
export const baseNFTUrl = `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;

export const baseProvider = new JsonRpcProvider(baseRpcUrl);

export const BASE_CHAIN_ID = 8453;

/**
 * A fresh Base provider whose every HTTP request is bounded by `requestTimeoutMs`
 * (ethers' default is 300 s — the whole Vercel function budget). Meant for cron routes
 * that must always return: build one per invocation and `destroy()` it in `finally`
 * so receipt polling never outlives the response.
 *
 * `staticNetwork` pins chain 8453 and skips the eth_chainId probe, which in ethers v6
 * retries forever (with a 1 s stall each time) if the RPC keeps failing.
 */
export const createBaseProvider = (opts: {
  requestTimeoutMs: number;
  pollingIntervalMs?: number;
}) => {
  const request = new FetchRequest(baseRpcUrl);
  request.timeout = opts.requestTimeoutMs;
  return new JsonRpcProvider(request, new Network("base", BASE_CHAIN_ID), {
    staticNetwork: true,
    // Base blocks every 2 s; ethers' default poll is 4 s.
    pollingInterval: opts.pollingIntervalMs ?? 2_000,
  });
};

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
