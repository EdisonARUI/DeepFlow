"use client";

import { cn } from "@/lib/utils";

export type OrderHistoryFilter = "all" | "swap" | "limit";

const FILTERS: { id: OrderHistoryFilter; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "swap", label: "SWAP" },
  { id: "limit", label: "LIMIT" },
];

type OrderHistoryFilterToggleProps = {
  value: OrderHistoryFilter;
  onChange: (value: OrderHistoryFilter) => void;
};

export function OrderHistoryFilterToggle({
  value,
  onChange,
}: OrderHistoryFilterToggleProps) {
  return (
    <div className="flex h-7 items-center rounded-[16px] border border-accent-cyan-pill p-px">
      {FILTERS.map((filter) => {
        const isSelected = filter.id === value;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={cn(
              "flex h-full min-w-[52px] cursor-pointer items-center justify-center rounded-[16px] px-1.5 text-[10px] tracking-[0.5px] uppercase transition-colors",
              isSelected
                ? "bg-accent-cyan-pill text-black"
                : "text-text-primary hover:bg-bg-pill-inactive/40",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
