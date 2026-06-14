"use client";

import { AssetIcon } from "@/components/asset-icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SwapAmountBlockProps = {
  label: string;
  balanceLabel: string;
  amount: string;
  onAmountChange?: (value: string) => void;
  readOnly?: boolean;
  asset: string;
  className?: string;
};

export function SwapAmountBlock({
  label,
  balanceLabel,
  amount,
  onAmountChange,
  readOnly = false,
  asset,
  className,
}: SwapAmountBlockProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border-muted/60 bg-bg-secondary/80 p-[17px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] tracking-[0.55px] text-text-muted/70 uppercase">
          {label}
        </span>
        <span className="text-[11px] tracking-[0.55px] text-text-muted uppercase">
          {balanceLabel}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Input
          value={amount}
          readOnly={readOnly}
          onChange={readOnly ? undefined : (e) => onAmountChange?.(e.target.value)}
          placeholder="0.00"
          className="h-auto flex-1 rounded-none border-0 bg-transparent p-0 text-[30px] leading-9 shadow-none focus-visible:ring-0"
        />
        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border-default bg-border-default/40 px-[13px] py-[7px]">
          <AssetIcon asset={asset} />
          <span className="text-sm font-semibold text-text-primary">{asset}</span>
        </div>
      </div>
    </div>
  );
}
