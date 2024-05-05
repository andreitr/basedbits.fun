"use client";
import {ReactNode} from "react";
import {http, createConfig, WagmiProvider, createStorage, cookieStorage, State, cookieToInitialState} from 'wagmi'
import {base} from 'wagmi/chains'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {metaMask} from "@wagmi/connectors";
import {ReadonlyHeaders} from "next/dist/server/web/spec-extension/adapters/headers";

export const config = createConfig({
    chains: [base],
    ssr: true,
    storage: createStorage({
        storage: cookieStorage,
    }),
    connectors: [metaMask()],
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