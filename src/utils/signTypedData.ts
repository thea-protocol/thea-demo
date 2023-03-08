import { Magic } from "magic-sdk";

export const signTypedDataV4 = async (
  user: `0x${string}`,
  signTypedDataV4Payload: any
) => {
  const magic = new Magic("pk_live_326101EA888E5CC4", {
    network: {
      rpcUrl: "https://matic-mumbai.chainstacklabs.com",
      chainId: 80001,
    },
  });

  const params = [user, signTypedDataV4Payload];
  const signature = await magic.rpcProvider.request({
    method: "eth_signTypedData_v4",
    params,
  });
  return signature;
};
