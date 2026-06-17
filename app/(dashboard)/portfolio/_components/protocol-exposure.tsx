"use client";

import { ResponsiveContainer, Treemap } from "recharts";
import type { TreemapNode } from "recharts/types/chart/Treemap";
import type { ProtocolExposureItem } from "@/lib/data/portfolio/types";
import { DashboardPanel } from "@/components/dashboard-panel";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const CELL_GAP = 4;

type ProtocolExposureProps = {
  exposure: ProtocolExposureItem[];
};

function formatProtocolLabel(name: string): string {
  if (name === "DEEPBOOK") return "DeepBook";
  if (name === "SUILEND") return "Suilend";
  if (name === "WALLET") return "Wallet";
  return name.charAt(0) + name.slice(1).toLowerCase();
}

function createExposureCell(exposure: ProtocolExposureItem[]) {
  return function ExposureCell(props: TreemapNode) {
    const { x, y, width, height, name } = props;
    const item = exposure.find((entry) => entry.name === name);

    if (!item || width <= 0 || height <= 0) {
      return <g />;
    }

    const inset = CELL_GAP / 2;
    const cellX = x + inset;
    const cellY = y + inset;
    const cellWidth = Math.max(0, width - CELL_GAP);
    const cellHeight = Math.max(0, height - CELL_GAP);
    const compact = cellWidth < 80 || cellHeight < 60;

    return (
      <g>
        <rect
          x={cellX}
          y={cellY}
          width={cellWidth}
          height={cellHeight}
          rx={5}
          ry={5}
          fill={item.color}
          stroke="rgba(0, 218, 248, 0.2)"
          strokeWidth={1}
        />
        <foreignObject x={cellX} y={cellY} width={cellWidth} height={cellHeight}>
          <div className="flex h-full flex-col justify-between rounded-[5px] p-3 text-black">
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
  };
}

export function ProtocolExposure({ exposure }: ProtocolExposureProps) {
  const ExposureCell = createExposureCell(exposure);

  return (
    <DashboardPanel
      className="h-[525px] justify-between gap-5"
      contentClassName="flex flex-col justify-between gap-8"
      title="PROTOCOL_EXPOSURE"
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        {exposure.length === 0 ? (
          <p className="text-sm text-text-muted">No protocol exposure data.</p>
        ) : (
          <>
            <div className="mx-auto h-[285px] w-full max-w-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={exposure}
                  dataKey="value"
                  aspectRatio={4 / 3}
                  stroke="transparent"
                  content={ExposureCell}
                />
              </ResponsiveContainer>
            </div>
            <div className="mt-8 grid w-full grid-cols-2 gap-4">
              {exposure.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="size-2 shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-[10px] text-text-muted">
                      {formatProtocolLabel(item.name)} ({item.percent}%)
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
