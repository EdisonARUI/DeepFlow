"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { RotateCw } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ASSET_ALLOCATION,
  NET_WORTH,
  NET_WORTH_CHART,
  PROTOCOL_ACTIONS,
  PROTOCOL_FILTERS,
} from "@/lib/mock-data";

const TIMEFRAMES = ["1W", "15D", "1M"] as const;

export function NetWorthChart() {
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>("1M");

  return (
    <TerminalPanel
      className="col-span-2"
      contentClassName="p-0"
      title={
        <div className="flex flex-wrap items-center gap-4">
          <TerminalLabel>NET_WORTH_PERFORMANCE</TerminalLabel>
          <span className="text-2xl font-bold text-accent-cyan">
            ${NET_WORTH.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      }
      actions={
        <div className="flex gap-2">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf}
              variant="outline"
              size="sm"
              onClick={() => setTimeframe(tf)}
              className={cn(
                "h-auto rounded-none border-border-default px-3 py-1 text-[12px] tracking-[0.6px] uppercase",
                timeframe === tf
                  ? "border-accent-cyan bg-accent-cyan/5 text-accent-cyan"
                  : "bg-transparent text-text-muted",
              )}
            >
              {tf}
            </Button>
          ))}
        </div>
      }
    >
      <div className="h-[320px] px-6 pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={NET_WORTH_CHART} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e0ff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#00e0ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#b9ccb2", fontSize: 10, fontFamily: "var(--font-mono)" }}
              dy={8}
            />
            <Tooltip
              contentStyle={{
                background: "#201f1f",
                border: "1px solid #3b4b37",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
              labelStyle={{ color: "#b9ccb2" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00e0ff"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="url(#netWorthFill)"
              dot={{ fill: "#00e0ff", r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </TerminalPanel>
  );
}

export function AssetDistribution() {
  const [filter, setFilter] = useState<(typeof PROTOCOL_FILTERS)[number]>("ALL");

  return (
    <TerminalPanel
      contentClassName="p-0"
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
      <div className="flex flex-col items-center gap-8 p-8">
        <div className="relative size-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ASSET_ALLOCATION}
                dataKey="percent"
                nameKey="name"
                innerRadius={58}
                outerRadius={80}
                stroke="none"
              >
                {ASSET_ALLOCATION.map((entry) => (
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
          {ASSET_ALLOCATION.map((item) => (
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

export function ProtocolActionsHistory() {
  return (
    <TerminalPanel
      className="col-span-full"
      contentClassName="p-0"
      title={<TerminalLabel>PROTOCOL_ACTIONS_HISTORY</TerminalLabel>}
      actions={
        <span className="text-[12px] tracking-[0.6px] text-text-muted uppercase">
          Filter: supply_withdraw
        </span>
      }
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border-default hover:bg-transparent">
            {["DATE", "ACTION", "PROTOCOL", "ASSET", "AMOUNT", "STATUS", "TX_HASH"].map(
              (col) => (
                <TableHead
                  key={col}
                  className={cn(
                    "text-[11px] font-bold tracking-[0.6px] text-text-muted uppercase",
                    col === "TX_HASH" && "text-right",
                  )}
                >
                  {col}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PROTOCOL_ACTIONS.map((row) => (
            <TableRow key={row.txHash} className="border-border-muted/40">
              <TableCell className="text-[12px] text-text-primary/70">{row.date}</TableCell>
              <TableCell
                className={cn(
                  "text-[12px] font-bold uppercase",
                  row.action === "SUPPLY" ? "text-accent-cyan" : "text-accent-orange",
                )}
              >
                {row.action}
              </TableCell>
              <TableCell className="text-[12px]">{row.protocol}</TableCell>
              <TableCell className="text-[12px]">{row.asset}</TableCell>
              <TableCell
                className={cn(
                  "text-[12px]",
                  row.amount.startsWith("+") ? "text-accent-cyan" : "text-accent-orange",
                )}
              >
                {row.amount}
              </TableCell>
              <TableCell>
                <StatusBadge
                  variant={row.status === "COMPLETED" ? "completed" : "pending"}
                  dot
                >
                  {row.status}
                </StatusBadge>
              </TableCell>
              <TableCell className="text-right text-[12px] text-text-primary/50">
                {row.txHash}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TerminalPanel>
  );
}
