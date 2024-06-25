import {createConfig, webSocket} from "wagmi";
import {base, mainnet} from "wagmi/chains";

export const baseConfig = createConfig({
    chains: [base],
    transports: {
        [base.id]: webSocket(
            `wss://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
        ),
    },
});

export const ethConfig = createConfig({
    chains: [mainnet],
    transports: {
        [mainnet.id]: webSocket(
            `wss://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
        ),
    },
});