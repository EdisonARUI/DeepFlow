"use client";

import { useState } from "react";
import { MARKET_PAIRS } from "@/lib/mock-data";
import { MarketPairs } from "./market-pairs";
import { SwapWidget } from "./swap-widget";

export function TradingWorkspace() {
  const [selectedPair, setSelectedPair] = useState(MARKET_PAIRS[0].pair);
  const [isReversed, setIsReversed] = useState(false);

  const pairData =
    MARKET_PAIRS.find((p) => p.pair === selectedPair) ?? MARKET_PAIRS[0];

  return (
    <>
      <MarketPairs
        selectedPair={selectedPair}
        onSelectPair={setSelectedPair}
      />
      <SwapWidget
        pairData={pairData}
        isReversed={isReversed}
        onToggleDirection={() => setIsReversed((prev) => !prev)}
      />
    </>
  );
}
