import { Web3Provider } from "@ethersproject/providers";
import { TheaNetwork, TheaSDK, UserBalance } from "@thea-protocol/sdk";
import { createContext, useCallback, useEffect, useState } from "react";
import { WalletInfo, Magic } from "magic-sdk";

type State = {
  theaSDK?: TheaSDK;
  provider?: Web3Provider;
  account?: `0x${string}`;
  connector?: WalletInfo;
  connect?: () => Promise<string[]>;
  disconnect?: () => Promise<boolean>;
  userBalance?: UserBalance;
};

type Props = {
  children: React.ReactNode;
};

export const TheaSDKContext = createContext<State>({});

function TheaSDKProvider({ children }: Props) {
  const [state, setState] = useState<State>({});

  const loadSDK = useCallback(async () => {
    const magic = new Magic("pk_live_326101EA888E5CC4", {
      network: {
        rpcUrl: "https://matic-mumbai.chainstacklabs.com",
        chainId: 80001,
      },
    });

    const provider = new Web3Provider(magic.rpcProvider as any);

    const theaSDK = await TheaSDK.init({
      network: TheaNetwork.MUMBAI,
      web3Provider: provider,
    });

    setState((prevState) => ({
      ...prevState,
      provider,
      theaSDK,
      connect: async () => {
        try {
          const accounts = await magic.wallet.connectWithUI();
          const walletInfo = await magic.wallet.getInfo();
          setState((prevState) => ({
            ...prevState,
            account: accounts[0] as `0x${string}`,
            connector: walletInfo,
          }));
          return accounts;
        } catch (error) {
          console.log("Connect error: ", error);
          return [];
        }
      },
      disconnect: async () => {
        try {
          await magic.wallet.disconnect();
          setState((prevState) => ({
            ...prevState,
            account: undefined,
            connector: undefined,
          }));
          return true;
        } catch (error) {
          console.log("Disconnect error: ", error);
          return false;
        }
      },
    }));
  }, []);

  const loadBalance = useCallback(async () => {
    if (!state.theaSDK || !state.account) return;
    const balance = await state.theaSDK.carbonInfo.getUsersBalance(
      state.account.toLowerCase()
    );
    setState((prevState) => ({ ...prevState, userBalance: balance }));
  }, [state.theaSDK, state.account]);

  useEffect(() => {
    loadSDK();
  }, [loadSDK]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  return (
    <TheaSDKContext.Provider value={state}>{children}</TheaSDKContext.Provider>
  );
}

export default TheaSDKProvider;
