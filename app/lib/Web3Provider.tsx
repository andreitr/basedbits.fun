"use client";
import {ReactNode} from "react";
import {cookieStorage, cookieToInitialState, createConfig, createStorage, WagmiProvider, webSocket,} from "wagmi";
import {base} from "wagmi/chains";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ConnectKitProvider, getDefaultConfig} from "connectkit";

const config = createConfig(
    getDefaultConfig({
        ssr: true,
        storage: createStorage({
            storage: cookieStorage,
        }),
        chains: [base],
        transports: {
            [base.id]: webSocket(`wss://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`),
        },
        walletConnectProjectId: process.env
            .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
        appName: "Based Bits",


        appDescription: "Your App Description",
        appUrl: "https://basedbits.fun",
        // appIcon: "https://basedbits.fun/logo.png",
    }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({
                                 children,
                                 cookie,
                             }: Readonly<{
    cookie?: string | null;
    children: ReactNode;
}>) => {
    const initialState = cookieToInitialState(config, cookie);

    return (
        <WagmiProvider initialState={initialState} config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider>{children}</ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};
