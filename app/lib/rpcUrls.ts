// Plain constants with no wagmi import, so server code (ethers providers, page data reads) can use them without
// wagmi's "use client" modules being pulled into the page's client bundle
export const mainnetRpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;
export const baseRpcUrl = `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;
export const baseTestnetRpcUrl = `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;
export const baseNFTUrl = `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`;

export const BASE_CHAIN_ID = 8453;
