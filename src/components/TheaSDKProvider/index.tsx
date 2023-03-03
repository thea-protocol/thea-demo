import { TheaNetwork, TheaSDK, UserBalance } from "@mcovilo/thea-sdk";
import { createContext, useCallback, useEffect, useState } from "react";
import { useProvider, useSigner } from "wagmi";

type State = { theaSDK?: TheaSDK; userBalance?: UserBalance };
type Props = {
  children: React.ReactNode;
};

export const TheaSDKContext = createContext<State>({});

function TheaSDKProvider({ children }: Props) {
  const [theaSDK, setTheaSDK] = useState<TheaSDK>();
  const [userBalance, setUserBalance] = useState<UserBalance>();

  const provider = useProvider();
  const { data: signer } = useSigner();

  const loadSDK = useCallback(async () => {
    if (!signer) return;
    const sdk = await TheaSDK.init({
      network: TheaNetwork.MUMBAI,
      provider: provider,
      signer: signer,
    });
    const address = await signer.getAddress();
    const balance = await sdk.carbonInfo.getUsersBalance(address.toLowerCase());
    setTheaSDK(sdk);
    setUserBalance(balance);
    console.log(balance);
  }, [provider, signer]);

  useEffect(() => {
    loadSDK();
  }, [loadSDK, provider, signer]);

  return (
    <TheaSDKContext.Provider value={{ theaSDK, userBalance }}>
      {children}
    </TheaSDKContext.Provider>
  );
}

export default TheaSDKProvider;
