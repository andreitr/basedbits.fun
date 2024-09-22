import {createConfig, http} from "wagmi";
import {base, mainnet} from "wagmi/chains";

export const baseConfig = createConfig({
    chains: [base],
    transports: {
        [base.id]: http(
            `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
        ),
    },
});

export const ethConfig = createConfig({
    chains: [mainnet],
    transports: {
        [mainnet.id]: http(
            `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
        ),
    },
});

// Testnet config
// export const baseSepoliaConfig = createConfig({
//   chains: [baseSepolia],
//   transports: {
//     [baseSepolia.id]: http(
//       `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
//     ),
//   },
// });
