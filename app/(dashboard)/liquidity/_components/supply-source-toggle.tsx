"use client";

import { cn } from "@/lib/utils";
import type { SupplyFundSource } from "@/lib/data/liquidity/types";

const SUPPLY_SOURCES: { id: SupplyFundSource; label: string }[] = [
  { id: "wallet", label: "WALLET" },
  { id: "deepbook", label: "DEEPBOOK" },
];

type SupplySourceToggleProps = {
  value: SupplyFundSource;
  onChange: (value: SupplyFundSource) => void;
};

export function SupplySourceToggle({ value, onChange }: SupplySourceToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] font-bold tracking-[0.6px] text-accent-cyan-pill uppercase underline">
        SOURCE
      </span>
      <div className="flex items-center gap-2.5">
        {SUPPLY_SOURCES.map((option) => {
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
