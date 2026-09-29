import { FetchRequest, JsonRpcProvider, Network } from "ethers";
import { BASE_CHAIN_ID, baseRpcUrl } from "@/app/lib/Web3Configs";

// ethers lives here, not in Web3Configs, so client bundles that only need RPC URLs or wagmi configs don't pull it in

export const baseProvider = new JsonRpcProvider(baseRpcUrl);

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
