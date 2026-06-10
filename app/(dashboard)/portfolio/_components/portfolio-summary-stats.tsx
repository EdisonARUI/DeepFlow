import { Landmark } from "lucide-react";
import { PORTFOLIO_SUMMARY } from "@/lib/mock-data";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const STATS = [
  {
    label: "TOTAL_ASSETS",
    value: currencyFormatter.format(PORTFOLIO_SUMMARY.totalAssets),
    valueClassName: "text-accent-green",
    icon: Landmark,
  },
  {
    label: "WORKING_CAPITAL",
    value: currencyFormatter.format(PORTFOLIO_SUMMARY.workingCapital),
    valueClassName: "text-accent-cyan",
  },
  {
    label: "IDLE_CAPITAL",
    value: currencyFormatter.format(PORTFOLIO_SUMMARY.idleCapital),
    valueClassName: "text-text-primary",
  },
  {
    label: "UTILIZATION_RATE",
    value: `${PORTFOLIO_SUMMARY.utilizationRate}%`,
    valueClassName: "text-accent-orange",
  },
] as const;

export function PortfolioSummaryStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => (
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
