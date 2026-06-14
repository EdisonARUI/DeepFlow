"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { RotateCw } from "lucide-react";
import { AssetIcon } from "@/components/asset-icon";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AssetAllocationItem, ProtocolFilter } from "@/lib/data/portfolio/types";
import { PROTOCOL_FILTERS } from "@/lib/data/portfolio/types";

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
    <TerminalPanel
      className="flex h-full min-h-0 flex-col"
      contentClassName="flex min-h-0 flex-1 flex-col p-0"
      title={<TerminalLabel className="text-accent-green">ASSET_COMPOSITION</TerminalLabel>}
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
      <div className="flex border-b border-border-muted">
        {PROTOCOL_FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "flex-1 border-r border-border-muted px-3 py-2 text-[10px] tracking-[0.6px] uppercase",
              filter === item
                ? "bg-accent-cyan/10 text-accent-cyan"
                : "text-text-muted hover:text-text-primary",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex flex-1 flex-col items-center gap-8 p-8">
        {allocation.length === 0 ? (
          <p className="text-sm text-text-muted">No assets for this filter.</p>
        ) : (
          <>
            <div className="relative size-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    dataKey="percent"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={80}
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
                  <AssetIcon asset={item.name} size="sm" />
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
    </TerminalPanel>
  );
}
