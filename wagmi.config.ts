import { baseErc20abi } from "@/constants/abi/BaseERC20";
import { btmAbi } from "@/constants/abi/BaseTokenManager";
import { registryAbi } from "@/constants/abi/Registry";
import { theaErc1155Abi } from "@/constants/abi/TheaERC1155";
import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "BaseToken",
      abi: baseErc20abi,
      address: "0xb89b6A3A6DE8Ae535d26E7Ad94A7dD0Be88A6074",
    },
    {
      name: "VintageToken",
      abi: baseErc20abi,
      address: "0x737146EA29c72931E4FCc9b78Ff2EA28D2553658",
    },
    {
      name: "SDGToken",
      abi: baseErc20abi,
      address: "0xf60eFE9E4DE5F2cA6f1D1F1574A5eb58b759AcE1",
    },
    {
      name: "RatingToken",
      abi: baseErc20abi,
      address: "0xeC65e4c4f9185409fe152c35A86535F06615bbbf",
    },
    {
      name: "TheaERC1155",
      abi: theaErc1155Abi,
      address: "0x0d1543fa8057487f2fd36a643f1f211b2bc2b4b5",
    },
    {
      name: "BaseTokenManager",
      abi: btmAbi,
      address: "0x72b27872C7E72b2E5070EE848477D3b860dD3bc9",
    },
    {
      name: "Registry",
      abi: registryAbi,
      address: "0xa435d49fd8f892e6a070d5b4f6731b2331f6829d",
    },
  ],
  plugins: [react()],
});
