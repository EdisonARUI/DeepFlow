"use client";

import { cn } from "@/lib/utils";

export type TradeMode = "swap" | "limit";

const MODES: { id: TradeMode; label: string }[] = [
  { id: "swap", label: "SWAP" },
  { id: "limit", label: "LIMIT" },
];

type SwapModeToggleProps = {
  value: TradeMode;
  onChange: (value: TradeMode) => void;
};

export function SwapModeToggle({ value, onChange }: SwapModeToggleProps) {
  return (
    <div className="flex h-8 items-center rounded-[20px] border border-accent-cyan-pill p-px">
      {MODES.map((mode) => {
        const isSelected = mode.id === value;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={cn(
              "flex h-full min-w-[80px] cursor-pointer items-center justify-center rounded-[20px] px-2 text-[12px] tracking-[0.6px] uppercase transition-colors",
              isSelected
                ? "bg-accent-cyan-pill text-black"
                : "text-text-primary hover:bg-bg-pill-inactive/40",
            )}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
