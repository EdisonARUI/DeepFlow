"use client";

import { LayoutGrid } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MARKET_PAIRS } from "@/lib/mock-data";

type MarketPairsProps = {
  selectedPair: string;
  onSelectPair: (pair: string) => void;
};

export function MarketPairs({ selectedPair, onSelectPair }: MarketPairsProps) {
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
        {MARKET_PAIRS.map((pair) => (
          <button
            key={pair.pair}
            type="button"
            onClick={() => onSelectPair(pair.pair)}
            className={cn(
              "flex w-full items-center justify-between border-b border-border-muted/40 px-3 py-3 text-left text-[12px] tracking-[0.6px]",
              selectedPair === pair.pair
                ? "border-l-2 border-l-accent-cyan bg-accent-cyan/10"
                : "hover:bg-bg-panel-header/50",
            )}
          >
            <span>{pair.pair}</span>
            <span className="text-text-muted">{pair.price}</span>
          </button>
        ))}
      </ScrollArea>
    </TerminalPanel>
  );
}
