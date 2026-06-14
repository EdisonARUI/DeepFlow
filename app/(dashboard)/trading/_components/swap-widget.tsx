"use client";

import { useMemo } from "react";
import { ArrowDownUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TradeQuoteView, TradeFundLocation, TradingMarketView } from "@/lib/data/trading/types";
import type { TradeSimulationStatus } from "@/lib/data/trading/use-trade-simulation";
import { formatLiquidityBalance } from "@/lib/data/liquidity/liquidity-formatters";
import {
  computeToAmount,
  getSwapAssets,
} from "./trading-utils";
import { SwapAmountBlock } from "./swap-amount-block";
import { SwapExecutionInfo } from "./swap-execution-info";
import { SwapSegmentedControl } from "./swap-segmented-control";

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

  const isExecuting = executeStatus === "simulating";

  const payBalanceLabel = `BALANCE: ${formatLiquidityBalance(payBalance, payDecimals)} ${from}`;
  const receiveBalanceLabel = `BALANCE: ${formatLiquidityBalance(receiveBalance, receiveDecimals)} ${to}`;

  return (
    <div className="flex h-full flex-col gap-4 rounded-lg bg-bg-panel p-4">
      <SwapSegmentedControl
        label="SOURCE"
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
          className="flex size-[34px] cursor-pointer items-center justify-center rounded-full border border-border-default bg-bg-secondary transition-colors hover:border-accent-cyan hover:bg-accent-cyan/10"
          aria-label="Swap direction"
        >
          <ArrowDownUp className="size-4 text-accent-cyan" />
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
        value={fundDestination}
        onChange={onFundDestinationChange}
      />

      <SwapExecutionInfo rateLabel={rateLabel} feeLabel={quote?.feeLabel ?? "—"} />

      {executeError && (
        <p className="text-[12px] text-destructive">{executeError}</p>
      )}
      {executeStatus === "success" && (
        <p className="text-[12px] text-accent-green">模拟通过</p>
      )}

      <Button
        type="button"
        disabled={isExecuting}
        onClick={onExecute}
        className="mt-auto h-14 w-full rounded bg-accent-cyan text-lg font-bold tracking-[1.1px] text-[var(--text-on-accent)] uppercase hover:bg-accent-cyan/90"
      >
        <Zap className="size-5" />
        {isExecuting ? "Simulating…" : "Execute"}
      </Button>
    </div>
  );
}
