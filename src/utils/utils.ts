import { BigNumber, BigNumberish, constants, ethers } from "ethers";
import axios from "axios";
import {
  baseTokenConfig,
  btmConfig,
  ratingTokenConfig,
  registryConfig,
  sdgTokenConfig,
  theaErc1155Config,
  vintageTokenConfig,
} from "@/constants/abi";
import { baseErc20abi } from "@/constants/abi/BaseERC20";
import { getCurrentNonce } from "./sigNonces";
import { signTypedDataV4 } from "./signTypedData";

const RELAYER_URL =
  "https://api.defender.openzeppelin.com/autotasks/abeca809-b779-43e9-b78c-b66a34fed73b/runs/webhook/b2a2cb82-03ed-448c-9de5-43138da30ecd/36DEqMeT1YnSbSm1M1EXta";
axios.defaults.headers.post["Content-Type"] = "application/json";

// const rate = 1000;
// const unit = BigNumber.from(10 ** 4);

// const VINTAGE_VALUE = 2019;
// const SDG_VALUE = 15;
// const RATING_VALUE = 2;

// const VINTAGE_BASE = 2017;
// const SDG_BASE = 3;
// const RATING_BASE = 2;

export async function permit(
  tokenName: string,
  tokenAddress: `0x${string}`,
  user: `0x${string}`,
  spender: `0x${string}`,
  amount: BigNumberish
) {
  const domain = {
    name: tokenName,
    version: "1",
    chainId: 80001,
    verifyingContract: tokenAddress,
  } as const;

  const types = {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  const currentNonce = await getCurrentNonce(tokenAddress, baseErc20abi, user);
  const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

  const message = {
    owner: user,
    spender,
    value: amount.toString(),
    nonce: currentNonce.toHexString(),
    deadline,
  } as const;

  const signature = await signTypedDataV4(user, {
    domain,
    types,
    primaryType: "Permit",
    message,
  });

  const { v, r, s } = ethers.utils.splitSignature(signature);

  return { v, r, s, deadline };
}

export async function permitErc1155(
  user: `0x${string}`,
  operator: `0x${string}`
) {
  const domain = {
    name: "theaERC1155",
    version: "1",
    chainId: 80001,
    verifyingContract: theaErc1155Config.address,
  } as const;

  const types = {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    Permit: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  const currentNonce = await getCurrentNonce(
    theaErc1155Config.address,
    theaErc1155Config.abi,
    user
  );
  const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

  const message = {
    owner: user,
    operator,
    approved: true,
    nonce: currentNonce.toHexString(),
    deadline,
  } as const;

  const signature = await signTypedDataV4(user, {
    domain,
    types,
    primaryType: "Permit",
    message,
  });

  const { v, r, s } = ethers.utils.splitSignature(signature);

  return { v, r, s, deadline };
}

export async function convertWithSig(
  tokenId: BigNumberish,
  amount: BigNumberish,
  user: `0x${string}`
) {
  const vccSig = await permitErc1155(user, btmConfig.address);

  const domain = {
    name: "TheaBaseTokenManager",
    version: "1",
    chainId: 80001,
    verifyingContract: btmConfig.address,
  } as const;

  const types = {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    ConvertWithSig: [
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "owner", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  const currentNonce = await getCurrentNonce(
    btmConfig.address,
    btmConfig.abi,
    user
  );
  const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

  const message = {
    id: tokenId.toString(),
    amount: amount.toString(),
    owner: user,
    nonce: currentNonce.toHexString(),
    deadline,
  } as const;

  const signature = await signTypedDataV4(user, {
    domain,
    types,
    primaryType: "ConvertWithSig",
    message,
  });

  const { v, r, s } = ethers.utils.splitSignature(signature);

  const btm = new ethers.utils.Interface(btmConfig.abi);
  const encodedData = btm.encodeFunctionData("convertWithSig", [
    tokenId,
    amount,
    user,
    { v, r, s, deadline },
    vccSig,
  ]);

  return await axios.post(RELAYER_URL, {
    to: btmConfig.address,
    data: encodedData,
  });
}

export async function recoverWithSig(
  tokenId: BigNumberish,
  amount: BigNumberish,
  amountBt: BigNumberish,
  amountVintage: BigNumberish,
  amountSdg: BigNumberish,
  amountRating: BigNumberish,
  user: `0x${string}`
) {
  const baseTokenSig = await permit(
    "BT_2017",
    baseTokenConfig.address,
    user,
    btmConfig.address,
    amountBt
  );
  const permitSigs = [baseTokenSig];
  if (!BigNumber.from(amountSdg).isZero()) {
    const sdgSig = await permit(
      "vt",
      sdgTokenConfig.address,
      user,
      btmConfig.address,
      amountSdg
    );
    permitSigs.push(sdgSig);
  }
  if (!BigNumber.from(amountVintage).isZero()) {
    const vintageSig = await permit(
      "vt",
      vintageTokenConfig.address,
      user,
      btmConfig.address,
      amountVintage
    );
    permitSigs.push(vintageSig);
  }
  if (!BigNumber.from(amountRating).isZero()) {
    const ratingSig = await permit(
      "vt",
      ratingTokenConfig.address,
      user,
      btmConfig.address,
      amountRating
    );
    permitSigs.push(ratingSig);
  }

  const domain = {
    name: "TheaBaseTokenManager",
    version: "1",
    chainId: 80001,
    verifyingContract: btmConfig.address,
  } as const;

  const types = {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    RecoverWithSig: [
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "owner", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  const currentNonce = await getCurrentNonce(
    btmConfig.address,
    btmConfig.abi,
    user
  );
  const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

  const message = {
    id: tokenId.toString(),
    amount: amount.toString(),
    owner: user,
    nonce: currentNonce.toHexString(),
    deadline,
  } as const;

  const signature = await signTypedDataV4(user, {
    domain,
    types,
    primaryType: "RecoverWithSig",
    message,
  });

  const { v, r, s } = ethers.utils.splitSignature(signature);

  const btm = new ethers.utils.Interface(btmConfig.abi);
  const encodedData = btm.encodeFunctionData("recoverWithSig", [
    tokenId,
    amount,
    user,
    { v, r, s, deadline },
    permitSigs,
  ]);

  return await axios.post(RELAYER_URL, {
    to: btmConfig.address,
    data: encodedData,
  });
}

export async function retireWithSig(
  tokenId: BigNumberish,
  amount: BigNumberish,
  user: `0x${string}`
) {
  const vccSig = await permitErc1155(user, registryConfig.address);

  const domain = {
    name: "TheaRegistry",
    version: "1",
    chainId: 80001,
    verifyingContract: registryConfig.address,
  } as const;

  const types = {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    RetireWithSig: [
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "detailsId", type: "uint256" },
      { name: "owner", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  const currentNonce = await getCurrentNonce(
    registryConfig.address,
    registryConfig.abi,
    user
  );
  const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

  const message = {
    tokenId: tokenId.toString(),
    amount: amount.toString(),
    detailsId: constants.Zero,
    owner: user,
    nonce: currentNonce.toHexString(),
    deadline,
  } as const;

  const signature = await signTypedDataV4(user, {
    domain,
    types,
    primaryType: "RetireWithSig",
    message,
  });

  const { v, r, s } = ethers.utils.splitSignature(signature);

  const registry = new ethers.utils.Interface(registryConfig.abi);
  const encodedData = registry.encodeFunctionData("retireWithSig", [
    tokenId,
    amount,
    user,
    { v, r, s, deadline },
    vccSig,
  ]);

  return await axios.post(RELAYER_URL, {
    to: registryConfig.address,
    data: encodedData,
  });
}
