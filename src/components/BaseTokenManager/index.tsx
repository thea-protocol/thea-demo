import {
  baseTokenAddress,
  ratingTokenAddress,
  sdgTokenAddress,
  vintageTokenAddress,
} from "@/generated";
import React from "react";
import { useAccount, useBalance } from "wagmi";
import Convert from "./Convert";
import Recover from "./Recover";

function BaseTokenManager() {
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

  return (
    <div>
      <div className="flex space-x-4">
        <div className="mb-6 flex w-max items-center gap-2 rounded-md border py-2 px-4 shadow-md">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {baseTokenBalance?.formatted}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">Base</p>
        </div>
        <div className="mb-6 flex w-max items-center gap-2 rounded-md border py-2 px-4 shadow-md">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {vintageBalance?.formatted}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Vintage
          </p>
        </div>
        <div className="mb-6 flex w-max items-center gap-2 rounded-md border py-2 px-4 shadow-md">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {sdgBalance?.formatted}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">SDG</p>
        </div>
        <div className="mb-6 flex w-max items-center gap-2 rounded-md border py-2 px-4 shadow-md">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {ratingBalance?.formatted}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">Rating</p>
        </div>
      </div>
      <h2 className="text-4xl font-bold dark:text-white">Base Token Manager</h2>
      <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-4">
        <Convert />
        <Recover />
      </div>
    </div>
  );
}

export default BaseTokenManager;
