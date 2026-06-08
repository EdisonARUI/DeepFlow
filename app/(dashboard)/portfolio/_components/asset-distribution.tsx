"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { RotateCw } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ASSET_ALLOCATION_BY_FILTER, PROTOCOL_FILTERS } from "@/lib/mock-data";

export function AssetDistribution() {
  const [filter, setFilter] = useState<(typeof PROTOCOL_FILTERS)[number]>("ALL");
  const allocation = ASSET_ALLOCATION_BY_FILTER[filter];

  return (
    <TerminalPanel
      className="flex h-full min-h-0 flex-col"
      contentClassName="flex min-h-0 flex-1 flex-col p-0"
      title={<TerminalLabel>ASSET_DISTRIBUTION</TerminalLabel>}
      actions={
        <Button variant="ghost" size="icon-sm" className="text-accent-cyan">
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
        <div className="w-full space-y-2">
          <p className="text-[10px] tracking-[1px] text-text-muted uppercase opacity-50">
            Asset allocation
          </p>
          {allocation.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between border-b border-border-muted/40 py-1"
            >
              <div className="flex items-center gap-2">
                <span className="size-2" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-text-primary">{item.name}</span>
              </div>
              <span className="text-[10px]" style={{ color: item.color }}>
                {item.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </TerminalPanel>
  );
}
