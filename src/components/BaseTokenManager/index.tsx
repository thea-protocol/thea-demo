import { formatUnits } from "ethers/lib/utils.js";
import { Spinner } from "flowbite-react";
import React, { useContext } from "react";
import { TheaSDKContext } from "../TheaSDKProvider";
import Convert from "./Convert";
import Recover from "./Recover";

function BaseTokenManager() {
  const { account, userBalance } = useContext(TheaSDKContext);

  return (
    <div>
      {account && (
        <div className="flex flex-wrap space-x-4">
          <div>
            <h3 className="mb-2 text-2xl font-bold dark:text-white">
              Feature tokens
            </h3>
            <div className="flex space-x-4">
              <div className="mb-6 flex w-max items-center gap-2 rounded-md border py-2 px-4 shadow-md">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {userBalance ? (
                    formatUnits(userBalance.fungible.nbt, 4)
                  ) : (
                    <Spinner />
                  )}
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  Base
                </p>
              </div>
              <div className="mb-6 flex w-max items-center gap-2 rounded-md border py-2 px-4 shadow-md">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {userBalance ? (
                    formatUnits(userBalance.fungible.vintage, 4)
                  ) : (
                    <Spinner />
                  )}
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  Vintage
                </p>
              </div>
              <div className="mb-6 flex w-max items-center gap-2 rounded-md border py-2 px-4 shadow-md">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {userBalance ? (
                    formatUnits(userBalance.fungible.sdg, 4)
                  ) : (
                    <Spinner />
                  )}
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  SDG
                </p>
              </div>
              <div className="mb-6 flex w-max items-center gap-2 rounded-md border py-2 px-4 shadow-md">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {userBalance ? (
                    formatUnits(userBalance.fungible.rating, 4)
                  ) : (
                    <Spinner />
                  )}
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  Rating
                </p>
              </div>
            </div>
          </div>
          {userBalance && (
            <div>
              <h3 className="mb-2 text-2xl font-bold dark:text-white">NFTs</h3>
              <div className="flex flex-wrap space-x-4">
                {Object.keys(userBalance.nft).map((tokenId) => {
                  return (
                    userBalance.nft[tokenId] !== "0" && (
                      <div
                        key={tokenId}
                        className="mb-6 flex w-max items-center gap-2 rounded-md border py-2 px-4 shadow-md"
                      >
                        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                          {formatUnits(userBalance.nft[tokenId], 4)}
                        </h5>
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                          {tokenId}
                        </p>
                      </div>
                    )
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
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
