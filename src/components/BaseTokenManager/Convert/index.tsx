import {
  baseTokenManagerAddress,
  useBaseTokenManagerConvert,
  usePrepareBaseTokenManagerConvert,
  usePrepareTheaErc1155SetApprovalForAll,
  useTheaErc1155BalanceOf,
  useTheaErc1155SetApprovalForAll,
} from "@/generated";
import { convertWithSig } from "@/utils/utils";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";
import { Label, TextInput, Button } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

function Convert() {
  const [tokenId, setTokenId] = useState("0");
  const [amount, setAmount] = useState("0");
  const [error, setError] = useState<string>();

  const { address } = useAccount();
  const { data: theaErc1155Balance } = useTheaErc1155BalanceOf({
    args: [address!, BigNumber.from(tokenId || "0")],
    enabled: !!address,
    watch: true,
  });

  const { config: approveConfig } = usePrepareTheaErc1155SetApprovalForAll({
    args: [baseTokenManagerAddress, true],
    enabled: !!address,
    onSuccess(data) {
      console.log("Approve success =>", data);
    },
  });
  const { writeAsync: approve } =
    useTheaErc1155SetApprovalForAll(approveConfig);

  const { config: convertConfig } = usePrepareBaseTokenManagerConvert({
    args: [BigNumber.from(tokenId || "0"), parseUnits(amount || "0", 4)],
    enabled: !!tokenId && !!amount && !error,
  });
  const { writeAsync } = useBaseTokenManagerConvert(convertConfig);

  const convert = async (withSig?: boolean) => {
    if (!address || !tokenId || !amount) return;
    if (withSig) {
      await convertWithSig(
        BigNumber.from(tokenId),
        parseUnits(amount, 4),
        address
      );
    } else {
      await approve?.();
      await writeAsync?.().then(() => alert("Transaction was successful"));
    }
  };

  useEffect(() => {
    if (!theaErc1155Balance) return;
    const hasSufficientBalance = theaErc1155Balance.gte(
      parseUnits(amount || "0", 4)
    );
    setError(hasSufficientBalance ? undefined : "Insufficient Balance");
  }, [amount, theaErc1155Balance]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold dark:text-white">Convert</h3>
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
          <Button disabled={!!error} onClick={() => convert()}>
            Convert
          </Button>
          <Button disabled={!!error} onClick={() => convert(true)}>
            Convert with sig
          </Button>
        </div>
        <div>{error}</div>
      </div>
    </div>
  );
}

export default Convert;
