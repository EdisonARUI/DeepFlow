"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { usePortfolio } from "@/lib/data/portfolio/use-portfolio";
import { PortfolioSummaryStats } from "./portfolio-summary-stats";
import { TransactionHistory } from "./transaction-history";

const TIMEFRAMES = {
  "7_DAYS": 7,
  "30_DAYS": 30,
} as const;

const MAX_TRANSACTION_DAYS = 30;

type TimeframeKey = keyof typeof TIMEFRAMES;

function ChartSkeleton() {
  return <div className="h-72 animate-pulse rounded-[28px] bg-white/5" aria-hidden />;
}

const AssetComposition = dynamic(
  () => import("./asset-composition").then((module) => module.AssetComposition),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  },
);

const ProtocolExposure = dynamic(
  () => import("./protocol-exposure").then((module) => module.ProtocolExposure),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  },
);

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`rounded-[28px] bg-white/5 ${className ?? ""}`.trim()} aria-hidden />
  );
}

function PortfolioWorkspaceSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5 rounded-[45px] bg-bg-dashboard-shell p-5">
      <SkeletonCard className="h-10 w-full" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-28" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SkeletonCard className="h-72" />
        <SkeletonCard className="h-72" />
      </div>
      <SkeletonCard className="h-80" />
    </div>
  );
}

function PortfolioShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 rounded-[45px] bg-bg-dashboard-shell p-5">{children}</div>
  );
}

export function PortfolioWorkspace() {
  const account = useCurrentAccount();
  const [timeframe, setTimeframe] = useState<TimeframeKey>("30_DAYS");
  const transactionDays = TIMEFRAMES[timeframe];
  const { portfolio, isLoading, error, refetch } = usePortfolio(MAX_TRANSACTION_DAYS);

  const filteredTransactions = useMemo(() => {
    const cutoffMs = Date.now() - transactionDays * 24 * 60 * 60 * 1000;
    return portfolio.transactions.filter((tx) => tx.timestamp >= cutoffMs);
  }, [portfolio.transactions, transactionDays]);

  if (isLoading) {
    return <PortfolioWorkspaceSkeleton />;
  }

  if (error) {
    return (
      <PortfolioShell>
        <p className="text-sm text-text-muted">Failed to load portfolio: {error.message}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-sm text-accent-cyan underline"
        >
          Retry
        </button>
      </PortfolioShell>
    );
  }

  return (
    <PortfolioShell>
      {portfolio.transactionWarning && (
        <p className="text-sm text-text-muted">{portfolio.transactionWarning}</p>
      )}
      <PortfolioSummaryStats summary={portfolio.summary} />
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
        <AssetComposition
          allocationByFilter={portfolio.allocationByFilter}
          onRefresh={() => void refetch()}
        />
        <ProtocolExposure exposure={portfolio.exposure} />
      </div>
      <TransactionHistory
        transactions={filteredTransactions}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />
    </PortfolioShell>
  );
}
