import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

import type { AppProps } from "next/app";
import { Inter } from "@next/font/google";
import Navbar from "@/components/Navbar";
import TheaSDKProvider from "@/components/TheaSDKProvider";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TheaSDKProvider>
      <main className={`${inter.className} mx-auto max-w-7xl`}>
        <Navbar />
        <Component {...pageProps} />
      </main>
      <ToastContainer />
    </TheaSDKProvider>
  );
}
