"use client";

import { LayoutGrid } from "lucide-react";
import { ResponsiveContainer, Treemap } from "recharts";
import type { TreemapNode } from "recharts/types/chart/Treemap";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { PROTOCOL_EXPOSURE } from "@/lib/mock-data";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function ExposureCell(props: TreemapNode) {
  const { x, y, width, height, name } = props;
  const item = PROTOCOL_EXPOSURE.find((entry) => entry.name === name);

  if (!item || width <= 0 || height <= 0) {
    return <g />;
  }

  const compact = width < 80 || height < 60;
  const labelColor = item.textColor ?? "#001f25";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={item.color}
        stroke="rgba(0, 218, 248, 0.2)"
        strokeWidth={1}
      />
      <foreignObject x={x} y={y} width={width} height={height}>
        <div
          className="flex h-full flex-col justify-between p-3"
          style={{ color: labelColor }}
        >
          <div className="flex items-start justify-between gap-2 text-[10px] uppercase">
            <span className={compact ? "truncate opacity-80" : "opacity-80"}>{item.name}</span>
            {!compact ? <span className="tracking-[0.6px]">{item.percent}%</span> : null}
          </div>
          {!compact ? (
            <span className="text-[18px] leading-7">{currencyFormatter.format(item.value)}</span>
          ) : (
            <span className="text-[10px]">{item.percent}%</span>
          )}
        </div>
      </foreignObject>
    </g>
  );
}

export function ProtocolExposure() {
  return (
    <TerminalPanel
      className="flex h-full min-h-0 flex-col"
      contentClassName="flex min-h-0 flex-1 flex-col p-0"
      title={
        <TerminalLabel className="text-accent-cyan">PROTOCOL_EXPOSURE</TerminalLabel>
      }
      actions={
        <LayoutGrid className="size-5 text-accent-cyan" aria-hidden="true" />
      }
    >
      <div className="flex flex-1 flex-col items-center p-8">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={PROTOCOL_EXPOSURE}
              dataKey="value"
              aspectRatio={4 / 3}
              stroke="transparent"
              content={ExposureCell}
            />
          </ResponsiveContainer>
        </div>
        <div className="mt-8 grid w-full grid-cols-2 gap-4">
          {PROTOCOL_EXPOSURE.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="size-2 shrink-0" style={{ backgroundColor: item.color }} />
              <div>
                <p className="text-[10px] text-text-muted">
                  {item.name.charAt(0) + item.name.slice(1).toLowerCase()} ({item.percent}%)
                </p>
                <p className="text-[12px] tracking-[0.6px] text-text-primary">
                  {currencyFormatter.format(item.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TerminalPanel>
  );
}
