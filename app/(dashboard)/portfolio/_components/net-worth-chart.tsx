"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  chartAxisTickStyle,
  formatChartDate,
  formatChartValue,
  formatTooltipValue,
} from "@/lib/chart-formatters";
import { NET_WORTH, NET_WORTH_CHART_BY_TIMEFRAME } from "@/lib/mock-data";

const TIMEFRAMES = ["1W", "15D", "1M"] as const;

export function NetWorthChart() {
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>("1M");
  const chartData = NET_WORTH_CHART_BY_TIMEFRAME[timeframe];
  const xTickInterval = useMemo(() => {
    if (timeframe === "1W") return 0;
    if (timeframe === "15D") return 2;
    return 4;
  }, [timeframe]);

  return (
    <TerminalPanel
      className="col-span-2 flex h-full min-h-0 flex-col"
      contentClassName="flex min-h-0 flex-1 flex-col p-0"
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
      <div className="min-h-[240px] flex-1 px-6 pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 16, right: 8, left: 4, bottom: 8 }}
          >
            <defs>
              <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e0ff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#00e0ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={chartAxisTickStyle}
              tickFormatter={formatChartDate}
              interval={xTickInterval}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={chartAxisTickStyle}
              tickFormatter={formatChartValue}
              width={52}
            />
            <Tooltip
              contentStyle={{
                background: "#201f1f",
                border: "1px solid #3b4b37",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
              labelStyle={{ color: "#b9ccb2" }}
              labelFormatter={(label) => formatChartDate(String(label))}
              formatter={(value) => [formatTooltipValue(Number(value)), "Net Worth"]}
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
