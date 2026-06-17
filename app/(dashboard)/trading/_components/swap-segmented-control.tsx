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
  variant?: "source" | "destination";
};

export function SwapSegmentedControl({
  value,
  onChange,
  label,
  variant = "source",
}: SwapSegmentedControlProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      {label && (
        <span
          className={cn(
            "text-base font-bold tracking-[0.6px] uppercase underline",
            variant === "source" ? "text-accent-cyan-pill" : "text-accent-brand-badge",
          )}
        >
          {label}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-2.5">
        {FUND_LOCATIONS.map((option) => {
          const isSelected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "flex h-6 min-w-[60px] cursor-pointer items-center justify-center rounded-full px-2 text-[10px] tracking-[0.6px] uppercase transition-colors",
                isSelected
                  ? "bg-accent-cyan-pill text-black"
                  : "bg-bg-pill-inactive text-text-primary hover:bg-bg-pill-inactive/80",
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
