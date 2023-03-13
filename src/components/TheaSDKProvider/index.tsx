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
import { loginService, requestLoginService } from "@/services/authService";
import { signTypedDataV4 } from "@/utils/signTypedData";

type State = {
  theaSDK?: TheaSDK;
  provider?: Web3Provider;
  account?: `0x${string}`;
  connector?: WalletInfo;
  connect?: () => Promise<string[]>;
  disconnect?: () => Promise<boolean>;
  showUI?: () => Promise<boolean>;
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
      const account = accounts[0] as `0x${string}`;
      const walletInfo = await magic.wallet.getInfo();
      const challenge = await requestLoginService(account);
      const types = {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
        ],
        AuthMessage: [{ name: "content", type: "string" }],
      };
      const domain = {
        name: "Thea",
        version: "0.1",
        chainId: 80001,
      };
      const message = {
        content: challenge,
      };
      const signature = await signTypedDataV4(account, {
        domain,
        types,
        primaryType: "AuthMessage",
        message,
      });
      const formattedSig = `${signature.slice(-2)}.${signature.slice(
        2,
        66
      )}.${signature.slice(66, -2)}`.toUpperCase();
      await loginService({ challenge, signature: formattedSig });
      setState((prevState) => ({
        ...prevState,
        account,
        connector: walletInfo,
      }));
      return accounts;
    } catch (error) {
      await disconnect();
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
    showUI: async () => await magic.wallet.showUI(),
  });

  const loadSDK = useCallback(async () => {
    const theaSDK = await TheaSDK.init({
      network: TheaNetwork.MUMBAI,
      web3Provider: state.account ? provider : undefined,
      provider,
    });

    setState((prevState) => ({
      ...prevState,
      theaSDK,
    }));
  }, [provider, state.account]);

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
