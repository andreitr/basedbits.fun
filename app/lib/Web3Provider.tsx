"use client";

import { ReactNode } from "react";
import {
  cookieStorage,
  cookieToInitialState,
  createConfig,
  createStorage,
  http,
  WagmiProvider,
} from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { baseRpcUrl, baseTestnetRpcUrl } from "@/app/lib/Web3Configs";

const wagmiConfig = createConfig(
  getDefaultConfig({
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http(baseRpcUrl),
      [baseSepolia.id]: http(baseTestnetRpcUrl),
    },
    walletConnectProjectId: process.env
      .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
    appName: "Based Bits",
    appDescription: "Based Bits causing byte-sized mischief on the BASE chain.",
    appUrl: "https://basedbits.fun",
    appIcon: "https://www.basedbits.fun/images/icon.png",
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
  const initialState = cookieToInitialState(wagmiConfig, cookie);

  return (
    <WagmiProvider initialState={initialState} config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
