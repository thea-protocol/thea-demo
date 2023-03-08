import { Button } from "flowbite-react";
import React, { useContext } from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { TheaSDKContext } from "../TheaSDKProvider";

function Navbar() {
  const { connect, account, disconnect, connector, showUI } =
    useContext(TheaSDKContext);

  const connectWallet = async () => {
    try {
      connector?.walletType === "magic" ? await showUI?.() : await connect?.();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex w-full items-center justify-end gap-2 py-4">
      <Button pill outline onClick={connectWallet}>
        {account
          ? `${account.slice(0, 6)}...${account.slice(-4)}`
          : "Connect Wallet"}
      </Button>
      {account && (
        <Button pill onClick={disconnect}>
          <ArrowRightOnRectangleIcon strokeWidth={2} className="h-5" />
        </Button>
      )}
    </div>
  );
}

export default Navbar;
