import { BigNumber } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Button, TextInput, Label } from "flowbite-react";
import { parseUnits } from "ethers/lib/utils.js";
import { recoverWithSig } from "@/utils/utils";
import { TheaSDKContext } from "@/components/TheaSDKProvider";
import { readContract } from "@wagmi/core";
import {
  baseTokenManagerAddress,
  theaErc1155ABI,
  theaErc1155Address,
} from "@/generated";

function Recover() {
  const [tokenId, setTokenId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const { theaSDK, userBalance } = useContext(TheaSDKContext);
  const { address } = useAccount();

  const recover = async (withSig?: boolean) => {
    if (!address || !tokenId || !amount || !theaSDK) return;
    if (withSig) {
      try {
        const tokensRequired = await theaSDK.recover.queryRecoverFungibles(
          tokenId,
          parseUnits(amount, 4)
        );
        await recoverWithSig(
          BigNumber.from(tokenId),
          parseUnits(amount, 4),
          BigNumber.from(tokensRequired.cbt),
          BigNumber.from(tokensRequired.vintage),
          BigNumber.from(tokensRequired.sdg),
          BigNumber.from(tokensRequired.rating),
          address
        );
      } catch (error) {
        alert("Transaction failed");
        console.log(error);
      }
    } else {
      try {
        await theaSDK.recover.recoverNFT(tokenId, parseUnits(amount, 4));
        alert("Transaction successful");
      } catch (error) {
        alert("Transaction failed");
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (!tokenId || !amount || !theaSDK) return;
    (async () => {
      const tokensRequired = await theaSDK.recover.queryRecoverFungibles(
        tokenId,
        parseUnits(amount, 4)
      );
      const tokensAvailable = await readContract({
        address: theaErc1155Address,
        abi: theaErc1155ABI,
        functionName: "balanceOf",
        args: [baseTokenManagerAddress, BigNumber.from(tokenId)],
      });
      if (!tokensRequired || !userBalance) return;
      if (tokensAvailable.lt(parseUnits(amount, 4))) {
        setError("Recover amount more than available");
      } else if (
        BigNumber.from(userBalance.fungible.nbt).lt(tokensRequired.cbt)
      ) {
        setError("Insufficient base tokens");
      } else if (
        BigNumber.from(userBalance.fungible.vintage).lt(tokensRequired.vintage)
      ) {
        setError("Insufficient vintage tokens");
      } else if (
        BigNumber.from(userBalance.fungible.sdg).lt(tokensRequired.sdg)
      ) {
        setError("Insufficient sdg tokens");
      } else if (
        BigNumber.from(userBalance.fungible.rating).lt(tokensRequired.rating)
      ) {
        setError("Insufficient rating tokens");
      } else {
        setError("");
      }
    })();
  }, [amount, theaSDK, tokenId, userBalance]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold dark:text-white">Recover</h3>
        <div className="flex items-end gap-4 pt-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="token-id" value="VCC token ID" />
            </div>
            <TextInput
              value={tokenId}
              onChange={({ target }) => setTokenId(target.value)}
              id="token-id"
              type="number"
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="amount" value="Amount" />
            </div>
            <TextInput
              value={amount}
              onChange={({ target }) => setAmount(target.value)}
              id="amount"
              type="number"
              required
            />
          </div>
          <Button disabled={!!error} onClick={() => recover()}>
            Recover
          </Button>
          <Button disabled={!!error} onClick={() => recover(true)}>
            Recover with sig
          </Button>
        </div>
        <div>{error}</div>
      </div>
    </div>
  );
}

export default Recover;
