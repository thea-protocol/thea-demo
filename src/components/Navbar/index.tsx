import { Button } from "flowbite-react";
import React, { useContext } from "react";
import { TheaSDKContext } from "../TheaSDKProvider";

function Navbar() {
  const { connect, account } = useContext(TheaSDKContext);

  return (
    <div className="flex w-full justify-end py-4">
      <Button onClick={connect} pill outline>
        {account
          ? `${account.slice(0, 6)}...${account.slice(-4)}`
          : "Connect Wallet"}
      </Button>
    </div>
  );
}

export default Navbar;
