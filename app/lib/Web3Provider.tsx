"use client";

import {ReactNode} from "react";
import {cookieStorage, cookieToInitialState, createConfig, createStorage, WagmiProvider, webSocket,} from "wagmi";
import {base, mainnet} from "wagmi/chains";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ConnectKitProvider, getDefaultConfig} from "connectkit";

export const ethConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: webSocket(
      `wss://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    ),
  },
});

export const baseConfig = createConfig(
  getDefaultConfig({
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    chains: [base],
    transports: {
      [base.id]: webSocket(
        `wss://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
      ),
    },
    walletConnectProjectId: process.env
      .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
    appName: "Based Bits",

    appDescription: "Your App Description",
    appUrl: "https://basedbits.fun",
    appIcon: "https://www.basedbits.fun/favicon.ico",
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
  const initialState = cookieToInitialState(baseConfig, cookie);

  return (
    <WagmiProvider initialState={initialState} config={baseConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
