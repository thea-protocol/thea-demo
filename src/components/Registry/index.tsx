import React from "react";
import Retire from "./Retire";

function Registry() {
  return (
    <div>
      <h2 className="text-4xl font-bold dark:text-white">Registry</h2>
      <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-4">
        <Retire />
      </div>
    </div>
  );
}

export default Registry;
