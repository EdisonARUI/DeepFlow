"use client";

import { cn } from "@/lib/utils";
import type { TradeFundLocation } from "@/lib/data/trading/types";

const FUND_LOCATIONS: { id: TradeFundLocation; label: string }[] = [
  { id: "wallet", label: "WALLET" },
  { id: "navi", label: "NAVI" },
  { id: "suilend", label: "SUILEND" },
];

type SwapSegmentedControlProps = {
  value: TradeFundLocation;
  onChange: (value: TradeFundLocation) => void;
  label?: string;
};

export function SwapSegmentedControl({
  value,
  onChange,
  label,
}: SwapSegmentedControlProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-[11px] tracking-[1.1px] text-text-muted uppercase">
          {label}
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        {FUND_LOCATIONS.map((option) => {
          const isSelected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "cursor-pointer rounded px-[13px] py-[7px] text-[11px] tracking-[0.55px] uppercase transition-colors",
                isSelected
                  ? "border border-accent-cyan bg-accent-cyan-muted text-accent-cyan shadow-[0_0_10px_rgba(0,224,255,0.15)]"
                  : "border border-border-default bg-bg-secondary/50 text-text-muted hover:border-accent-cyan/40",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
