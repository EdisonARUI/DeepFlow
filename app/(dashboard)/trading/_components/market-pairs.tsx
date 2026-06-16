"use client";

import { LayoutGrid } from "lucide-react";
import { PairAssetIcon } from "@/components/pair-asset-icon";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { TradingMarketView } from "@/lib/data/trading/types";

type MarketPairsProps = {
  markets: TradingMarketView[];
  selectedPoolKey: string;
  onSelectPoolKey: (poolKey: string) => void;
  isLoading?: boolean;
};

export function MarketPairs({
  markets,
  selectedPoolKey,
  onSelectPoolKey,
  isLoading,
}: MarketPairsProps) {
  return (
    <TerminalPanel
      className="h-full"
      contentClassName="p-0"
      title={
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-3 text-accent-cyan" />
          <TerminalLabel>MARKET_PAIRS</TerminalLabel>
        </div>
      }
    >
      <ScrollArea className="h-[680px]">
        {isLoading && (
          <p className="px-3 py-3 text-[12px] text-text-muted">Loading markets…</p>
        )}
        {!isLoading &&
          markets.map((market) => (
            <button
              key={market.poolKey}
              type="button"
              onClick={() => onSelectPoolKey(market.poolKey)}
              className={cn(
                "flex w-full items-center justify-between border-b border-border-muted/40 px-3 py-3 text-left text-[12px] tracking-[0.6px]",
                selectedPoolKey === market.poolKey
                  ? "border-l-2 border-l-accent-cyan bg-accent-cyan/10"
                  : "hover:bg-bg-panel-header/50",
              )}
            >
              <div className="flex items-center gap-2">
                <PairAssetIcon
                  baseAsset={market.baseAsset}
                  quoteAsset={market.quoteAsset}
                />
                <span>{market.pair}</span>
              </div>
              <span className="text-text-muted">{market.price}</span>
            </button>
          ))}
      </ScrollArea>
    </TerminalPanel>
  );
}
