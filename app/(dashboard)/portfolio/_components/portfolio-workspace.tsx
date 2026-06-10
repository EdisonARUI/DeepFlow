"use client";

import { useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { usePortfolio } from "@/lib/data/portfolio/use-portfolio";
import { AssetComposition } from "./asset-composition";
import { PortfolioSummaryStats } from "./portfolio-summary-stats";
import { ProtocolExposure } from "./protocol-exposure";
import { TransactionHistory } from "./transaction-history";

const TIMEFRAMES = {
  "7_DAYS": 7,
  "30_DAYS": 30,
} as const;

type TimeframeKey = keyof typeof TIMEFRAMES;

export function PortfolioWorkspace() {
  const account = useCurrentAccount();
  const [timeframe, setTimeframe] = useState<TimeframeKey>("30_DAYS");
  const transactionDays = TIMEFRAMES[timeframe];
  const { portfolio, isLoading, error, refetch } = usePortfolio(transactionDays);

  const filteredTransactions = useMemo(() => {
    const cutoffMs = Date.now() - transactionDays * 24 * 60 * 60 * 1000;
    return portfolio.transactions.filter((tx) => tx.timestamp >= cutoffMs);
  }, [portfolio.transactions, transactionDays]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1280px] space-y-6 p-6">
        <p className="text-sm text-text-muted">Loading portfolio…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1280px] space-y-6 p-6">
        <p className="text-sm text-text-muted">Failed to load portfolio: {error.message}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-sm text-accent-cyan underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 p-6">
      {!account && (
        <p className="text-sm text-text-muted">
          连接钱包以查看个人持仓与链上交易；当前展示的是 mock / 市场演示数据。
        </p>
      )}
      {portfolio.priceWarning && (
        <p className="text-sm text-text-muted">{portfolio.priceWarning}</p>
      )}
      {portfolio.transactionWarning && (
        <p className="text-sm text-text-muted">{portfolio.transactionWarning}</p>
      )}
      <PortfolioSummaryStats summary={portfolio.summary} />
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
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
    </div>
  );
}
