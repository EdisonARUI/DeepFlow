"use client";

import { AssetIcon } from "@/components/asset-icon";
import { DashboardPanel } from "@/components/dashboard-panel";
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
    <DashboardPanel
      title="MARKET PAIRS"
      className="h-full min-h-[500px] xl:min-h-[795px]"
      contentClassName="flex min-h-0 flex-col"
    >
      <ScrollArea className="min-h-0 flex-1">
        {isLoading && (
          <p className="px-3 py-3 text-[12px] text-text-muted">Loading markets…</p>
        )}
        {!isLoading &&
          markets.map((market) => {
            const isSelected = selectedPoolKey === market.poolKey;

            return (
              <button
                key={market.poolKey}
                type="button"
                onClick={() => onSelectPoolKey(market.poolKey)}
                className={cn(
                  "relative flex w-full items-center justify-between border-b border-border-default px-3 py-3 text-left text-[12px] tracking-[0.6px] hover:bg-selection-highlight-hover",
                  isSelected && "bg-selection-highlight text-black hover:bg-selection-highlight",
                )}
              >
                {isSelected && (
                  <span className="pointer-events-none absolute inset-y-1 left-0 w-[3px] rounded-full bg-selection-highlight" />
                )}
                <div className="flex items-center gap-1">
                  <AssetIcon asset={market.baseAsset} size="md" />
                  <span className={cn(isSelected ? "text-black" : "text-text-primary")}>
                    {market.pair}
                  </span>
                </div>
                <span className={cn(isSelected ? "text-black/70" : "text-text-muted")}>
                  {market.price}
                </span>
              </button>
            );
          })}
      </ScrollArea>
    </DashboardPanel>
  );
}
