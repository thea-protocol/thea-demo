import { BigNumber, Contract, ContractInterface } from "ethers";
import { Magic } from "magic-sdk";
import { Web3Provider } from "@ethersproject/providers";

export const getCurrentNonce = async (
  address: `0x${string}`,
  abi: ContractInterface,
  user: `0x${string}`
): Promise<BigNumber> => {
  const magic = new Magic("pk_live_326101EA888E5CC4", {
    network: {
      rpcUrl: "https://matic-mumbai.chainstacklabs.com",
      chainId: 80001,
    },
  });

  const provider = new Web3Provider((magic as any).rpcProvider);
  const contract = new Contract(address, abi, provider);
  const currentNonce = await contract.sigNonces(user);
  return currentNonce;
};
