"use client";

import {http, createConfig, WagmiProvider} from 'wagmi'
import {base} from 'wagmi/chains'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {metaMask} from "@wagmi/connectors";

const config = createConfig({
    chains: [base],
    connectors: [
        metaMask(),
    ],
    transports: {
        [base.id]: http(),
    },
});

const queryClient = new QueryClient()

export const Web3Provider = ({
                                 children,
                             }: Readonly<{
    children: React.ReactNode;
}>) => {
    return <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </WagmiProvider>
}