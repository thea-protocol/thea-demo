import { ConnectKitButton } from "connectkit";
import React from "react";

type Props = {};

function Navbar({}: Props) {
  return (
    <div className="flex w-full justify-end py-4">
      <ConnectKitButton showBalance />
    </div>
  );
}

export default Navbar;
