"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  cookieStorage,
  cookieToInitialState,
  createConfig,
  createStorage,
  http,
  useAccount,
  WagmiProvider,
} from "wagmi";
import { watchAccount } from "@wagmi/core";
import { base, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { baseRpcUrl, baseTestnetRpcUrl } from "@/app/lib/Web3Configs";

// Give up waiting on a stuck reconnect so wallet-gated UI never spins forever
const RECONNECT_TIMEOUT_MS = 5_000;

const WalletReadyContext = createContext(false);

export const Web3Provider = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const [queryClient] = useState(() => new QueryClient());
  const [walletReady, setWalletReady] = useState(false);

  const wagmiConfig = useMemo(() => {
    const sharedConfig = {
      ssr: true,
      storage: createStorage({
        storage: cookieStorage,
      }),
      chains: [base, baseSepolia],
      transports: {
        [base.id]: http(baseRpcUrl),
        [baseSepolia.id]: http(baseTestnetRpcUrl),
      },
    } as const;

    if (typeof window === "undefined") {
      return createConfig({
        ...sharedConfig,
        connectors: [],
      });
    }

    return createConfig(
      getDefaultConfig({
        ...sharedConfig,
        walletConnectProjectId: process.env
          .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
        appName: "Based Bits",
        appDescription:
          "Based Bits causing byte-sized mischief on the BASE chain.",
        appUrl: "https://basedbits.fun",
        appIcon: "https://www.basedbits.fun/images/icon.png",
      }),
    );
  }, []);

  // Pages are statically rendered, so every visit starts disconnected and wagmi restores the wallet after mount.
  // Visitors with no saved connection are known to be disconnected right away; returning ones wait for the reconnect.
  useEffect(() => {
    const saved = cookieToInitialState(wagmiConfig, document.cookie);
    if (!saved?.current) {
      setWalletReady(true);
      return;
    }

    let reconnecting = false;
    const timeout = setTimeout(
      () => setWalletReady(true),
      RECONNECT_TIMEOUT_MS,
    );
    const unwatch = watchAccount(wagmiConfig, {
      onChange: ({ status }) => {
        if (status === "reconnecting") reconnecting = true;
        if (
          status === "connected" ||
          (status === "disconnected" && reconnecting)
        ) {
          setWalletReady(true);
        }
      },
    });

    return () => {
      clearTimeout(timeout);
      unwatch();
    };
  }, [wagmiConfig]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <WalletReadyContext.Provider value={walletReady}>
            {children}
          </WalletReadyContext.Provider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

/**
 * Account state that is safe to branch layout on. While `isReady` is false the wallet may still be restoring,
 * so render a placeholder the same size as the connected UI rather than a "connect wallet" prompt.
 */
export const useWallet = () => {
  const isReady = useContext(WalletReadyContext);
  const { address, isConnected } = useAccount();
  return { isReady, address, isConnected: isReady && isConnected };
};
