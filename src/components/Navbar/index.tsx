import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

type Props = {};

function Navbar({}: Props) {
  return (
    <div className="flex w-full justify-end py-4">
      <ConnectButton />
    </div>
  );
}

export default Navbar;
