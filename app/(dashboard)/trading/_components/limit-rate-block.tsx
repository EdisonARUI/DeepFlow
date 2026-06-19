"use client";

import { ArrowDownUp } from "lucide-react";
import type { LimitOrderSide } from "@deepflow/sdk/trade";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LimitRateBlockProps = {
  side: LimitOrderSide;
  baseAsset: string;
  quoteAsset: string;
  price: string;
  onPriceChange: (value: string) => void;
  onToggleSide: () => void;
};

export function LimitRateBlock({
  side,
  baseAsset,
  quoteAsset,
  price,
  onPriceChange,
  onToggleSide,
}: LimitRateBlockProps) {
  const targetAsset = side === "BUY" ? baseAsset : quoteAsset;
  const label =
    side === "BUY"
      ? `BUY ${baseAsset} AT RATE`
      : `SELL ${baseAsset} AT RATE`;

  return (
    <div className="relative rounded-[20px] border border-border-muted/60 bg-[rgba(11,15,16,0.8)] p-[17px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
      <div className="mb-2">
        <span className="text-[11px] tracking-[0.55px] text-text-muted/70 uppercase">
          {label}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Input
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
          placeholder="0"
          className="h-auto flex-1 rounded-none border-0 bg-transparent p-0 text-sm leading-9 text-white shadow-none focus-visible:ring-0"
        />
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-sm font-semibold text-text-primary">{targetAsset}</span>
          <button
            type="button"
            onClick={onToggleSide}
            className={cn(
              "flex size-3.5 cursor-pointer items-center justify-center rounded-sm",
              "text-text-muted transition-colors hover:text-accent-cyan",
            )}
            aria-label="Toggle buy or sell side"
          >
            <ArrowDownUp className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
