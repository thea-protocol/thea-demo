import { BigNumber, constants, ethers } from "ethers";
import { readContract, signTypedData } from "@wagmi/core";
import { baseErc20abi } from "@/constants/abi/BaseERC20";
import {
  baseTokenAddress,
  baseTokenManagerABI,
  baseTokenManagerAddress,
  ratingTokenAddress,
  registryABI,
  registryAddress,
  sdgTokenAddress,
  theaErc1155ABI,
  theaErc1155Address,
  vintageTokenAddress,
} from "@/generated";
import axios from "axios";

const RELAYER_URL =
  "https://api.defender.openzeppelin.com/autotasks/abeca809-b779-43e9-b78c-b66a34fed73b/runs/webhook/b2a2cb82-03ed-448c-9de5-43138da30ecd/36DEqMeT1YnSbSm1M1EXta";
axios.defaults.headers.post["Content-Type"] = "application/json";

const rate = 1000;
const unit = BigNumber.from(10 ** 4);

const VINTAGE_VALUE = 2019;
const SDG_VALUE = 15;
const RATING_VALUE = 2;

const VINTAGE_BASE = 2017;
const SDG_BASE = 3;
const RATING_BASE = 2;

export async function permit(
  tokenName: string,
  tokenAddress: `0x${string}`,
  user: `0x${string}`,
  spender: `0x${string}`,
  amount: BigNumber
) {
  const domain = {
    name: tokenName,
    version: "1",
    chainId: 80001,
    verifyingContract: tokenAddress,
  } as const;

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  const currentNonce = await readContract({
    address: tokenAddress,
    abi: baseErc20abi,
    functionName: "sigNonces",
    args: [user],
  });
  const deadline = BigNumber.from(Math.floor(Date.now() / 1000) + 20 * 60);

  const value = {
    owner: user,
    spender,
    value: amount,
    nonce: currentNonce,
    deadline,
  } as const;

  const signature = await signTypedData({ domain, types, value });

  const { v, r, s } = ethers.utils.splitSignature(signature);

  return { v, r, s, deadline };
}

export async function permitErc1155(
  tokenAddress: `0x${string}`,
  user: `0x${string}`,
  operator: `0x${string}`
) {
  const domain = {
    name: "theaERC1155",
    version: "1",
    chainId: 80001,
    verifyingContract: tokenAddress,
  } as const;

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  const currentNonce = await readContract({
    address: tokenAddress,
    abi: theaErc1155ABI,
    functionName: "sigNonces",
    args: [user],
  });
  const deadline = BigNumber.from(Math.floor(Date.now() / 1000) + 20 * 60);

  const value = {
    owner: user,
    operator,
    approved: true,
    nonce: currentNonce,
    deadline,
  } as const;

  const signature = await signTypedData({ domain, types, value });

  const { v, r, s } = ethers.utils.splitSignature(signature);

  return { v, r, s, deadline };
}

export async function convertWithSig(
  tokenId: BigNumber,
  amount: BigNumber,
  user: `0x${string}`
) {
  const vccSig = await permitErc1155(theaErc1155Address, user, registryAddress);

  const domain = {
    name: "TheaBaseTokenManager",
    version: "1",
    chainId: 80001,
    verifyingContract: baseTokenManagerAddress,
  } as const;

  const types = {
    ConvertWithSig: [
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "owner", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  const currentNonce = await readContract({
    address: baseTokenManagerAddress,
    abi: baseTokenManagerABI,
    functionName: "sigNonces",
    args: [user],
  });
  const deadline = BigNumber.from(Math.floor(Date.now() / 1000) + 20 * 60);

  const value = {
    id: tokenId,
    amount,
    owner: user,
    nonce: currentNonce,
    deadline,
  } as const;

  const signature = await signTypedData({ domain, types, value });

  const { v, r, s } = ethers.utils.splitSignature(signature);

  const btm = new ethers.utils.Interface(baseTokenManagerABI);
  const encodedData = btm.encodeFunctionData("convertWithSig", [
    tokenId,
    amount,
    user,
    { v, r, s, deadline },
    vccSig,
  ]);

  try {
    const response = await axios.post(RELAYER_URL, {
      to: baseTokenManagerAddress,
      data: encodedData,
    });
    alert("Convert with sig successful");
    console.log(response);
  } catch (error) {
    console.log("Convert with sig error : ", error);
  }
}

export async function recoverWithSig(
  tokenId: BigNumber,
  amount: BigNumber,
  user: `0x${string}`
) {
  const baseTokenSig = await permit(
    "BT_2017",
    baseTokenAddress,
    user,
    baseTokenManagerAddress,
    unit.mul(amount).div(rate)
  );
  const vintageSig = await permit(
    "vt",
    vintageTokenAddress,
    user,
    baseTokenManagerAddress,
    unit
      .mul(VINTAGE_VALUE - VINTAGE_BASE)
      .mul(amount)
      .div(rate)
  );
  const sdgSig = await permit(
    "vt",
    sdgTokenAddress,
    user,
    baseTokenManagerAddress,
    unit
      .mul(SDG_VALUE - SDG_BASE)
      .mul(amount)
      .div(rate)
  );
  const ratingSig = await permit(
    "vt",
    ratingTokenAddress,
    user,
    baseTokenManagerAddress,
    unit
      .mul(RATING_VALUE - RATING_BASE)
      .mul(amount)
      .div(rate)
  );

  const domain = {
    name: "TheaBaseTokenManager",
    version: "1",
    chainId: 80001,
    verifyingContract: baseTokenManagerAddress,
  } as const;

  const types = {
    RecoverWithSig: [
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "owner", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  const currentNonce = await readContract({
    address: baseTokenManagerAddress,
    abi: baseTokenManagerABI,
    functionName: "sigNonces",
    args: [user],
  });
  const deadline = BigNumber.from(Math.floor(Date.now() / 1000) + 20 * 60);

  const value = {
    id: tokenId,
    amount,
    owner: user,
    nonce: currentNonce,
    deadline,
  } as const;

  const signature = await signTypedData({ domain, types, value });

  const { v, r, s } = ethers.utils.splitSignature(signature);

  const btm = new ethers.utils.Interface(baseTokenManagerABI);
  const encodedData = btm.encodeFunctionData("recoverWithSig", [
    tokenId,
    amount,
    user,
    { v, r, s, deadline },
    [baseTokenSig, vintageSig, sdgSig, ratingSig],
  ]);

  try {
    const response = await axios.post(RELAYER_URL, {
      to: baseTokenManagerAddress,
      data: encodedData,
    });
    alert("Recover with sig successful");
    console.log(response);
  } catch (error) {
    console.log("Recover with sig error : ", error);
  }
}

export async function retireWithSig(
  tokenId: BigNumber,
  amount: BigNumber,
  user: `0x${string}`
) {
  const vccSig = await permitErc1155(theaErc1155Address, user, registryAddress);

  const domain = {
    name: "TheaRegistry",
    version: "1",
    chainId: 80001,
    verifyingContract: registryAddress,
  } as const;

  const types = {
    RetireWithSig: [
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "detailsId", type: "uint256" },
      { name: "owner", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  const currentNonce = await readContract({
    address: registryAddress,
    abi: registryABI,
    functionName: "sigNonces",
    args: [user],
  });
  const deadline = BigNumber.from(Math.floor(Date.now() / 1000) + 20 * 60);

  const value = {
    tokenId,
    amount,
    detailsId: constants.Zero,
    owner: user,
    nonce: currentNonce,
    deadline,
  } as const;

  const signature = await signTypedData({ domain, types, value });

  const { v, r, s } = ethers.utils.splitSignature(signature);

  const registry = new ethers.utils.Interface(registryABI);
  const encodedData = registry.encodeFunctionData("retireWithSig", [
    tokenId,
    amount,
    user,
    { v, r, s, deadline },
    vccSig,
  ]);

  try {
    const response = await axios.post(RELAYER_URL, {
      to: registryAddress,
      data: encodedData,
    });
    alert("Retire with sig successful");
    console.log(response);
  } catch (error) {
    console.log("Retire with sig error : ", error);
  }
}
