"use client";
import {ReactNode} from "react";
import {cookieStorage, cookieToInitialState, createConfig, createStorage, http, WagmiProvider} from 'wagmi'
import {base} from 'wagmi/chains'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {metaMask} from "@wagmi/connectors";

export const config = createConfig({
    chains: [base],
    ssr: true,
    storage: createStorage({
        storage: cookieStorage,
    }),
    connectors: [metaMask(
        {
            dappMetadata: {
                name: "Based Bits",
                url: "https://basedbits.fun",
            }
        }
    )],
    transports: {
        [base.id]: http(),
    },
});

const queryClient = new QueryClient()

export const Web3Provider = ({
                                 children,
                                 cookie
                             }: Readonly<{
    cookie?: string | null,
    children: ReactNode;
}>) => {

    const initialState = cookieToInitialState(
        config,
        cookie
    )

    return <WagmiProvider initialState={initialState} config={config}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </WagmiProvider>
}