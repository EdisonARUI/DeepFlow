"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AssetAllocationItem, ProtocolFilter } from "@/lib/data/portfolio/types";
import { PROTOCOL_FILTERS } from "@/lib/data/portfolio/types";
import { DashboardPanel } from "@/components/dashboard-panel";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type AssetCompositionProps = {
  allocationByFilter: Record<ProtocolFilter, AssetAllocationItem[]>;
  onRefresh?: () => void;
};

export function AssetComposition({ allocationByFilter, onRefresh }: AssetCompositionProps) {
  const [filter, setFilter] = useState<ProtocolFilter>("ALL");
  const allocation = allocationByFilter[filter];

  return (
    <DashboardPanel
      className="h-[525px] justify-between gap-5"
      contentClassName="flex flex-col justify-between gap-5"
      title="ASSET_COMPOSITION"
      actions={
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-accent-cyan"
          onClick={onRefresh}
          disabled={!onRefresh}
        >
          <RotateCw className="size-4" />
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        {PROTOCOL_FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "flex h-6 min-w-10 items-center justify-center rounded-[20px] px-2 text-[10px] tracking-[0.6px] uppercase",
              filter === item
                ? "bg-accent-cyan-pill text-black"
                : "bg-bg-pill-inactive text-text-primary",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex flex-1 flex-col items-center justify-between gap-8">
        {allocation.length === 0 ? (
          <p className="text-sm text-text-muted">No assets for this filter.</p>
        ) : (
          <>
            <div className="relative size-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    dataKey="percent"
                    nameKey="name"
                    innerRadius={90}
                    outerRadius={125}
                    stroke="none"
                  >
                    {allocation.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-accent-cyan">ASSET_HEALTH</span>
                <span className="text-base font-bold text-text-primary">OPTIMAL</span>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-4">
              {allocation.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="size-2 shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-[10px] text-text-muted">
                      {item.name} ({item.percent}%)
                    </p>
                    <p className="text-[12px] tracking-[0.6px] text-text-primary">
                      {currencyFormatter.format(item.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardPanel>
  );
}
