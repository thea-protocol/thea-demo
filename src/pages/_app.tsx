import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "@next/font/google";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { polygonMumbai } from "wagmi/chains";
import Navbar from "@/components/Navbar";

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

const client = createClient(
  getDefaultClient({
    appName: "Thea demo",
    chains: chains,
    autoConnect: true,
    provider: provider,
    webSocketProvider: webSocketProvider,
  })
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider
        customTheme={{ "--ck-font-family": inter.style.fontFamily }}
      >
        <main className={`${inter.className} mx-auto max-w-7xl`}>
          <Navbar />
          <Component {...pageProps} />
        </main>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
