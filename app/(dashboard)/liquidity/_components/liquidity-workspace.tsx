"use client";

import { useState } from "react";
import { DEFI_ROWS, getDeFiRowKey } from "@/lib/mock-data";
import { DeFiConnectivity } from "./defi-connectivity";
import { PositionManagement } from "./position-management";

export function LiquidityWorkspace() {
  const [selectedKey, setSelectedKey] = useState(getDeFiRowKey(DEFI_ROWS[0]));
  const selectedRow =
    DEFI_ROWS.find((row) => getDeFiRowKey(row) === selectedKey) ?? DEFI_ROWS[0];

  return (
    <>
      <DeFiConnectivity selectedKey={selectedKey} onSelect={setSelectedKey} />
      <PositionManagement selectedRow={selectedRow} onAssetChange={setSelectedKey} />
    </>
  );
}
