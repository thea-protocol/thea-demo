import { Web3Provider } from "@ethersproject/providers";
import { TheaNetwork, TheaSDK, UserBalance } from "@thea-protocol/sdk";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WalletInfo, Magic } from "magic-sdk";
import dynamic from "next/dynamic";

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
  const magic = useMemo(
    () =>
      new Magic("pk_live_326101EA888E5CC4", {
        network: {
          rpcUrl: "https://matic-mumbai.chainstacklabs.com",
          chainId: 80001,
        },
      }),
    []
  );

  const provider = useMemo(
    () => new Web3Provider((magic as any).rpcProvider),
    [magic]
  );

  const connect = async () => {
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
  };

  const disconnect = async () => {
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
  };

  const [state, setState] = useState<State>({
    provider,
    connect,
    disconnect,
  });

  const loadSDK = useCallback(async () => {
    const theaSDK = await TheaSDK.init({
      network: TheaNetwork.MUMBAI,
      web3Provider: provider,
    });

    setState((prevState) => ({
      ...prevState,
      theaSDK,
    }));
  }, [provider]);

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

export default dynamic(() => Promise.resolve(TheaSDKProvider), { ssr: false });
