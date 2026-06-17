"use client";

import { useMemo } from "react";
import { ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPanel } from "@/components/dashboard-panel";
import type { TradeQuoteView, TradeFundLocation, TradingMarketView } from "@/lib/data/trading/types";
import type { TradeSimulationStatus } from "@/lib/data/trading/use-trade-simulation";
import type { TradingWriteMode } from "@/lib/data/trading/resolve-trading-write-mode";
import { formatLiquidityBalance } from "@/lib/data/liquidity/liquidity-formatters";
import { getTransactionExplorerUrl } from "@/lib/sui/explorer";
import {
  computeToAmount,
  getSwapAssets,
} from "./trading-utils";
import { SwapAmountBlock } from "./swap-amount-block";
import { SwapExecutionInfo } from "./swap-execution-info";
import { SwapSegmentedControl } from "./swap-segmented-control";

function truncateDigest(digest: string): string {
  if (digest.length <= 12) return digest;
  return `${digest.slice(0, 6)}...${digest.slice(-4)}`;
}

type SwapWidgetProps = {
  market: TradingMarketView;
  isReversed: boolean;
  onToggleDirection: () => void;
  fromAmount: string;
  onFromAmountChange: (value: string) => void;
  fundSource: TradeFundLocation;
  fundDestination: TradeFundLocation;
  onFundSourceChange: (value: TradeFundLocation) => void;
  onFundDestinationChange: (value: TradeFundLocation) => void;
  payBalance: bigint;
  payDecimals: number;
  receiveBalance: bigint;
  receiveDecimals: number;
  quote: TradeQuoteView | null;
  onExecute: () => void;
  executeStatus: TradeSimulationStatus;
  executeError?: string;
  txDigest?: string;
  writeMode?: TradingWriteMode;
};

export function SwapWidget({
  market,
  isReversed,
  onToggleDirection,
  fromAmount,
  onFromAmountChange,
  fundSource,
  fundDestination,
  onFundSourceChange,
  onFundDestinationChange,
  payBalance,
  payDecimals,
  receiveBalance,
  receiveDecimals,
  quote,
  onExecute,
  executeStatus,
  executeError,
  txDigest,
  writeMode = "simulate",
}: SwapWidgetProps) {
  const { from, to, displayRate } = useMemo(
    () => getSwapAssets(market, isReversed),
    [market, isReversed],
  );

  const parsedFromAmount = parseFloat(fromAmount) || 0;
  const toAmount = computeToAmount(
    parsedFromAmount,
    market,
    isReversed,
    quote?.estimatedOutput,
  );

  const rateLabel =
    quote && parsedFromAmount > 0
      ? `1 ${from} = ${(quote.estimatedOutput / parsedFromAmount).toFixed(4)} ${to}`
      : `1 ${from} = ${displayRate.toFixed(4)} ${to}`;

  const isBusy = executeStatus === "simulating" || executeStatus === "executing";

  const buttonLabel = (() => {
    if (executeStatus === "simulating") return "Simulating…";
    if (executeStatus === "executing") return "Signing…";
    return "Execute";
  })();

  const payBalanceLabel = `BALANCE: ${formatLiquidityBalance(payBalance, payDecimals)} ${from}`;
  const receiveBalanceLabel = `BALANCE: ${formatLiquidityBalance(receiveBalance, receiveDecimals)} ${to}`;

  return (
    <DashboardPanel
      title="DEEPBOOK"
      className="h-full min-h-[500px] xl:min-h-[795px]"
      contentClassName="flex min-h-0 flex-col justify-between gap-5"
    >
      <div className="flex flex-col gap-3">
        <SwapSegmentedControl
          label="SOURCE"
          variant="source"
          value={fundSource}
          onChange={onFundSourceChange}
        />

        <SwapAmountBlock
          label="PAY"
          balanceLabel={payBalanceLabel}
          amount={fromAmount}
          onAmountChange={onFromAmountChange}
          asset={from}
        />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onToggleDirection}
            className="flex size-[34px] cursor-pointer items-center justify-center rounded-full border border-border-default bg-bg-primary p-2.5 transition-colors hover:border-accent-cyan/40"
            aria-label="Swap direction"
          >
            <ArrowDownUp className="size-4 text-text-primary" />
          </button>
        </div>

        <SwapAmountBlock
          label="RECEIVE (EST)"
          balanceLabel={receiveBalanceLabel}
          amount={toAmount > 0 ? toAmount.toFixed(4) : ""}
          readOnly
          asset={to}
        />

        <SwapSegmentedControl
          label="DESTINATION"
          variant="destination"
          value={fundDestination}
          onChange={onFundDestinationChange}
        />

        <SwapExecutionInfo rateLabel={rateLabel} feeLabel={quote?.feeLabel ?? "—"} />

        {executeError && (
          <p className="text-[12px] text-destructive">{executeError}</p>
        )}
        {executeStatus === "success" && (
          <p className="text-[12px] text-accent-green">Simulation passed</p>
        )}
        {executeStatus === "executed" && txDigest && (
          <p className="text-[12px] text-accent-green">
            Transaction submitted:{" "}
            <a
              href={getTransactionExplorerUrl(txDigest)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan underline"
            >
              {truncateDigest(txDigest)}
            </a>
          </p>
        )}
      </div>

      <Button
        type="button"
        disabled={isBusy}
        onClick={onExecute}
        className="h-8 w-full rounded-[20px] bg-accent-cyan text-[11px] font-bold tracking-[0.6px] text-[var(--text-on-accent)] uppercase hover:bg-accent-cyan/90"
      >
        {buttonLabel}
      </Button>
    </DashboardPanel>
  );
}
