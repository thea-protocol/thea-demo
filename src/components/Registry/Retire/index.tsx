import { TheaSDKContext } from "@/components/TheaSDKProvider";
import { retireWithSig } from "@/utils/utils";
import { parseUnits } from "ethers/lib/utils.js";
import { Label, TextInput, Button } from "flowbite-react";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

function Retire() {
  const [tokenId, setTokenId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const { theaSDK, userBalance, account } = useContext(TheaSDKContext);

  const retire = async (withSig?: boolean) => {
    if (!account || !tokenId || !amount || !theaSDK) return;
    try {
      if (withSig) {
        await retireWithSig(tokenId, parseUnits(amount, 4), account);
      } else {
        await theaSDK.offset.offsetNFT(tokenId, parseUnits(amount, 4));
      }
      toast.success("Transaction success");
    } catch (error) {
      toast.error("Transaction failed");
      console.log(error);
    }
  };

  useEffect(() => {
    if (!tokenId || !amount || !userBalance) return;
    if (!userBalance.nft[tokenId]) {
      setError("No balance");
    } else if (parseUnits(amount, 4).gt(userBalance.nft[tokenId])) {
      setError("Insufficient balance");
    } else {
      setError("");
    }
  }, [amount, tokenId, userBalance]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold dark:text-white">Retire</h3>
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
          <Button disabled={!!error} onClick={() => retire()}>
            Retire
          </Button>
          <Button disabled={!!error} onClick={() => retire(true)}>
            Retire with sig
          </Button>
        </div>
        <div>{error}</div>
      </div>
    </div>
  );
}

export default Retire;
