import { baseErc20abi } from "./BaseERC20";
import { btmAbi } from "./BaseTokenManager";
import { registryAbi } from "./Registry";
import { theaErc1155Abi } from "./TheaERC1155";

const baseTokenConfig = {
  address: "0xb89b6A3A6DE8Ae535d26E7Ad94A7dD0Be88A6074",
  abi: baseErc20abi,
} as const;

const vintageTokenConfig = {
  address: "0x737146EA29c72931E4FCc9b78Ff2EA28D2553658",
  abi: baseErc20abi,
} as const;

const sdgTokenConfig = {
  address: "0xf60eFE9E4DE5F2cA6f1D1F1574A5eb58b759AcE1",
  abi: baseErc20abi,
} as const;

const ratingTokenConfig = {
  address: "0xeC65e4c4f9185409fe152c35A86535F06615bbbf",
  abi: baseErc20abi,
} as const;

const btmConfig = {
  address: "0x72b27872C7E72b2E5070EE848477D3b860dD3bc9",
  abi: btmAbi,
} as const;

const registryConfig = {
  address: "0xa435d49fd8f892e6a070d5b4f6731b2331f6829d",
  abi: registryAbi,
} as const;

const theaErc1155Config = {
  address: "0x0d1543fa8057487f2fd36a643f1f211b2bc2b4b5",
  abi: theaErc1155Abi,
} as const;

export {
  baseTokenConfig,
  vintageTokenConfig,
  sdgTokenConfig,
  ratingTokenConfig,
  btmConfig,
  registryConfig,
  theaErc1155Config,
};
