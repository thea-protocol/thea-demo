import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { Inter } from "@next/font/google";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { polygonMumbai } from "wagmi/chains";
import Navbar from "@/components/Navbar";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { rainbowMagicConnector } from "@/constants/RainbowMagicConnector";
import TheaSDKProvider from "@/components/TheaSDKProvider";

const inter = Inter({ subsets: ["latin"] });

const { provider, webSocketProvider, chains } = configureChains(
  [polygonMumbai],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        return { http: chain.rpcUrls.default.http[0] };
      },
    }),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ chains }),
      walletConnectWallet({ chains }),
      // @ts-ignore
      rainbowMagicConnector({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <TheaSDKProvider>
          <main className={`${inter.className} mx-auto max-w-7xl`}>
            <Navbar />
            <Component {...pageProps} />
          </main>
        </TheaSDKProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
