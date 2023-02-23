import {
  baseTokenAddress,
  baseTokenManagerAddress,
  ratingTokenAddress,
  sdgTokenAddress,
  useBaseTokenApprove,
  useBaseTokenManagerRecover,
  usePrepareBaseTokenManagerRecover,
  useRatingTokenApprove,
  useSdgTokenApprove,
  useVintageTokenApprove,
  vintageTokenAddress,
} from "@/generated";
import { BigNumber } from "ethers";
import React, { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { Button, TextInput, Label } from "flowbite-react";
import { parseUnits } from "ethers/lib/utils.js";
import { recoverWithSig } from "@/utils/utils";

const rate = 1000;
const unit = BigNumber.from(10 ** 4);

const VINTAGE_VALUE = 2019;
const SDG_VALUE = 15;
const RATING_VALUE = 2;

const VINTAGE_BASE = 2017;
const SDG_BASE = 3;
const RATING_BASE = 2;

function Recover() {
  const [tokenId, setTokenId] = useState("0");
  const [amount, setAmount] = useState("0");
  const [error, setError] = useState<string>();

  const { address } = useAccount();
  const { data: baseTokenBalance } = useBalance({
    address: address,
    token: baseTokenAddress,
    watch: true,
  });
  const { data: vintageBalance } = useBalance({
    address: address,
    token: vintageTokenAddress,
    watch: true,
  });
  const { data: sdgBalance } = useBalance({
    address: address,
    token: sdgTokenAddress,
    watch: true,
  });
  const { data: ratingBalance } = useBalance({
    address: address,
    token: ratingTokenAddress,
    watch: true,
  });

  const { writeAsync: approveBT } = useBaseTokenApprove({
    mode: "recklesslyUnprepared",
    args: [
      baseTokenManagerAddress,
      unit.mul(parseUnits(amount || "0", 4)).div(rate),
    ],
    onSuccess(data) {
      console.log("Approve BT success =>", data);
    },
  });
  const { writeAsync: approveVintage } = useVintageTokenApprove({
    mode: "recklesslyUnprepared",
    args: [
      baseTokenManagerAddress,
      unit
        .mul(
          unit
            .mul(VINTAGE_VALUE - VINTAGE_BASE)
            .mul(parseUnits(amount || "0", 4))
            .div(rate)
        )
        .div(rate),
    ],
    onSuccess(data) {
      console.log("Approve vintage success =>", data);
    },
  });
  const { writeAsync: approveSDG } = useSdgTokenApprove({
    mode: "recklesslyUnprepared",
    args: [
      baseTokenManagerAddress,
      unit
        .mul(SDG_VALUE - SDG_BASE)
        .mul(parseUnits(amount || "0", 4))
        .div(rate),
    ],
    onSuccess(data) {
      console.log("Approve SDG success =>", data);
    },
  });
  const { writeAsync: approveRT } = useRatingTokenApprove({
    mode: "recklesslyUnprepared",
    args: [
      baseTokenManagerAddress,
      unit
        .mul(RATING_VALUE - RATING_BASE)
        .mul(parseUnits(amount || "0", 4))
        .div(rate),
    ],
    onSuccess(data) {
      console.log("Approve rating success =>", data);
    },
  });

  const { config } = usePrepareBaseTokenManagerRecover({
    args: [BigNumber.from(tokenId || "0"), parseUnits(amount || "0", 4)],
    enabled: !!tokenId && !!amount && !error,
  });
  const { writeAsync } = useBaseTokenManagerRecover(config);

  const recover = async (withSig?: boolean) => {
    if (!address || !tokenId || !amount) return;
    if (withSig) {
      await recoverWithSig(
        BigNumber.from(tokenId),
        parseUnits(amount, 4),
        address
      );
    } else {
      await approveBT?.();
      await approveVintage?.();
      await approveSDG?.();
      await approveRT?.();
      await writeAsync?.().then(() => alert("Transaction was successful"));
    }
  };

  useEffect(() => {
    if (!baseTokenBalance || !vintageBalance || !sdgBalance || !ratingBalance)
      return;
    setError(
      baseTokenBalance.value.gte(
        unit.mul(parseUnits(amount || "0", 4)).div(rate)
      )
        ? vintageBalance.value.gte(
            unit
              .mul(
                unit
                  .mul(VINTAGE_VALUE - VINTAGE_BASE)
                  .mul(parseUnits(amount || "0", 4))
                  .div(rate)
              )
              .div(rate)
          )
          ? sdgBalance.value.gte(
              unit
                .mul(SDG_VALUE - SDG_BASE)
                .mul(parseUnits(amount || "0", 4))
                .div(rate)
            )
            ? ratingBalance.value.gte(
                unit
                  .mul(RATING_VALUE - RATING_BASE)
                  .mul(parseUnits(amount || "0", 4))
                  .div(rate)
              )
              ? undefined
              : "Insufficient rating tokens"
            : "Insufficient SDG tokens"
          : "Insufficient vintage tokens"
        : "Insufficient base tokens"
    );
  }, [amount, baseTokenBalance, ratingBalance, sdgBalance, vintageBalance]);

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
