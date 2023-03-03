import { MagicConnectConnector } from "@everipedia/wagmi-magic-connector";

export const rainbowMagicConnector = ({ chains }: any) => ({
  id: "magic",
  name: "Magic",
  iconUrl: "https://svgshare.com/i/iJK.svg",
  iconBackground: "#fff",
  createConnector: () => {
    const connector = new MagicConnectConnector({
      chains: chains,
      options: {
        apiKey: "pk_live_326101EA888E5CC4",
        magicSdkConfiguration: {
          network: {
            rpcUrl: "https://rpc-mumbai.maticvigil.com",
            chainId: 80001,
          },
        },
      },
    });
    return {
      connector,
    };
  },
});
