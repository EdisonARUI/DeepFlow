import type { PortfolioSummaryView } from "@/lib/data/portfolio/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type PortfolioSummaryStatsProps = {
  summary: PortfolioSummaryView;
};

export function PortfolioSummaryStats({ summary }: PortfolioSummaryStatsProps) {
  const stats = [
    {
      label: "IDLE_CAPITAL",
      value: currencyFormatter.format(summary.idleCapital),
      valueClassName: "text-text-primary",
    },
    {
      label: "UTILIZATION_RATE",
      value: `${summary.utilizationRate.toFixed(2)}%`,
      valueClassName: "text-accent-rate",
    },
    {
      label: "TOTAL_ASSETS",
      value: currencyFormatter.format(summary.totalAssets),
      valueClassName: "text-accent-green",
    },
    {
      label: "WORKING_CAPITAL",
      value: currencyFormatter.format(summary.workingCapital),
      valueClassName: "text-accent-cyan",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex h-[100px] flex-col justify-center gap-2 overflow-hidden rounded-[20px] bg-bg-dashboard-card p-5"
        >
          <p className="text-base font-bold text-text-muted uppercase">{stat.label}</p>
          <p className={`text-[32px] leading-none font-bold ${stat.valueClassName}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
