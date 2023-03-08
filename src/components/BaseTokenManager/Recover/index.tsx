import { BigNumber, Contract } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { Button, TextInput, Label } from "flowbite-react";
import { parseUnits } from "ethers/lib/utils.js";
import { recoverWithSig } from "@/utils/utils";
import { TheaSDKContext } from "@/components/TheaSDKProvider";
import { btmConfig, theaErc1155Config } from "@/constants/abi";

function Recover() {
  const [tokenId, setTokenId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const { theaSDK, userBalance, account, provider } =
    useContext(TheaSDKContext);

  const recover = async (withSig?: boolean) => {
    if (!account || !tokenId || !amount || !theaSDK) return;
    try {
      if (withSig) {
        const tokensRequired = await theaSDK.recover.queryRecoverFungibles(
          tokenId,
          parseUnits(amount, 4)
        );
        await recoverWithSig(
          tokenId,
          parseUnits(amount, 4),
          tokensRequired.cbt,
          tokensRequired.vintage,
          tokensRequired.sdg,
          tokensRequired.rating,
          account
        );
      } else {
        await theaSDK.recover.recoverNFT(tokenId, parseUnits(amount, 4));
      }
      alert("Transaction successful");
    } catch (error) {
      alert("Transaction failed");
      console.log(error);
    }
  };

  useEffect(() => {
    if (!tokenId || !amount || !theaSDK) return;
    (async () => {
      const tokensRequired = await theaSDK.recover.queryRecoverFungibles(
        tokenId,
        parseUnits(amount, 4)
      );
      const theaErc1155 = new Contract(
        theaErc1155Config.address,
        theaErc1155Config.abi,
        provider
      );
      const tokensAvailable = await theaErc1155.balanceOf(
        btmConfig.address,
        BigNumber.from(tokenId)
      );
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
  }, [amount, provider, theaSDK, tokenId, userBalance]);

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
