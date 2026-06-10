import { Landmark } from "lucide-react";
import type { PortfolioSummaryView } from "@/lib/data/portfolio/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type PortfolioSummaryStatsProps = {
  summary: PortfolioSummaryView;
};

export function PortfolioSummaryStats({ summary }: PortfolioSummaryStatsProps) {
  const stats = [
    {
      label: "TOTAL_ASSETS",
      value: currencyFormatter.format(summary.totalAssets),
      valueClassName: "text-accent-green",
      icon: Landmark,
    },
    {
      label: "WORKING_CAPITAL",
      value: currencyFormatter.format(summary.workingCapital),
      valueClassName: "text-accent-cyan",
    },
    {
      label: "IDLE_CAPITAL",
      value: currencyFormatter.format(summary.idleCapital),
      valueClassName: "text-text-primary",
    },
    {
      label: "UTILIZATION_RATE",
      value: `${summary.utilizationRate}%`,
      valueClassName: "text-accent-orange",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden border border-border-default bg-bg-panel px-5 py-5"
        >
          {"icon" in stat && stat.icon ? (
            <stat.icon className="absolute top-0 right-0 size-9 text-accent-cyan/20" />
          ) : null}
          <p className="text-[11px] font-bold tracking-[1.1px] text-text-muted uppercase">
            {stat.label}
          </p>
          <p className={`mt-2 text-[32px] leading-none font-bold ${stat.valueClassName}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
