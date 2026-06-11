"use client";

import { useMemo } from "react";
import { ArrowDownUp, Zap } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TradeQuoteView, TradingMarketView } from "@/lib/data/trading/types";
import type { TradeSimulationStatus } from "@/lib/data/trading/use-trade-simulation";
import { formatLiquidityBalance } from "@/lib/data/liquidity/liquidity-formatters";
import {
  computeToAmount,
  formatBalance,
  getSwapAssets,
} from "./trading-utils";

type SwapWidgetProps = {
  market: TradingMarketView;
  isReversed: boolean;
  onToggleDirection: () => void;
  fromAmount: string;
  onFromAmountChange: (value: string) => void;
  creditBalance?: {
    asset: string;
    suppliedBalance: bigint;
    decimals: number;
  };
  quote: TradeQuoteView | null;
  onExecute: () => void;
  executeStatus: TradeSimulationStatus;
  executeError?: string;
  creditSourceLabel?: string;
};

export function SwapWidget({
  market,
  isReversed,
  onToggleDirection,
  fromAmount,
  onFromAmountChange,
  creditBalance,
  quote,
  onExecute,
  executeStatus,
  executeError,
  creditSourceLabel = "NAVI",
}: SwapWidgetProps) {
  const { from, to, displayRate } = useMemo(
    () => getSwapAssets(market, isReversed),
    [market, isReversed],
  );

  const fromBalanceHuman = creditBalance
    ? Number(creditBalance.suppliedBalance) / 10 ** creditBalance.decimals
    : 0;

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

  return (
    <TerminalPanel
      className="h-full"
      contentClassName="flex flex-col gap-4 p-6"
      title={<TerminalLabel>SWAP_WIDGET</TerminalLabel>}
    >
      <div className="text-[11px] text-text-muted uppercase">
        Credit Source: {creditSourceLabel}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] text-text-muted uppercase">
          <span>From</span>
          <span>
            Balance:{" "}
            {creditBalance
              ? `${formatLiquidityBalance(creditBalance.suppliedBalance, creditBalance.decimals)} ${from}`
              : `${formatBalance(fromBalanceHuman)} ${from}`}
          </span>
        </div>
        <div className="flex items-center gap-3 border border-border-default bg-bg-secondary p-4">
          <Input
            value={fromAmount}
            onChange={(e) => onFromAmountChange(e.target.value)}
            className="h-auto flex-1 rounded-none border-0 bg-transparent p-0 text-3xl shadow-none focus-visible:ring-0"
          />
          <Select value={from.toLowerCase()} disabled>
            <SelectTrigger className="w-24 rounded-none border-border-default">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={market.baseAsset.toLowerCase()}>
                {market.baseAsset}
              </SelectItem>
              <SelectItem value={market.quoteAsset.toLowerCase()}>
                {market.quoteAsset}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onToggleDirection}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border-default bg-bg-panel transition-colors hover:border-accent-cyan hover:bg-accent-cyan/10"
          aria-label="Swap direction"
        >
          <ArrowDownUp className="size-4 text-accent-cyan" />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] text-text-muted uppercase">
          <span>To</span>
          <span>{to}</span>
        </div>
        <div className="flex items-center gap-3 border border-border-default bg-bg-secondary p-4">
          <Input
            readOnly
            value={toAmount > 0 ? toAmount.toFixed(4) : "0.00"}
            className="h-auto flex-1 rounded-none border-0 bg-transparent p-0 text-3xl shadow-none focus-visible:ring-0"
          />
          <Select value={to.toLowerCase()} disabled>
            <SelectTrigger className="w-24 rounded-none border-border-default">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={market.baseAsset.toLowerCase()}>
                {market.baseAsset}
              </SelectItem>
              <SelectItem value={market.quoteAsset.toLowerCase()}>
                {market.quoteAsset}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <dl className="space-y-2 border-t border-border-muted/40 pt-4 text-[12px] tracking-[0.6px]">
        <div className="flex justify-between">
          <dt className="text-text-muted">Rate</dt>
          <dd>{rateLabel}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-muted">Fee</dt>
          <dd className="text-accent-cyan">{quote?.feeLabel ?? "—"}</dd>
        </div>
      </dl>
      {executeError && (
        <p className="text-[12px] text-destructive">{executeError}</p>
      )}
      {executeStatus === "success" && (
        <p className="text-[12px] text-accent-green">模拟通过，PTB 管线已更新</p>
      )}
      <Button
        type="button"
        disabled={isExecuting}
        onClick={onExecute}
        className="mt-auto h-12 w-full rounded-none bg-accent-cyan text-sm font-bold tracking-[1.1px] text-[var(--text-on-accent)] uppercase hover:bg-accent-cyan/90"
      >
        <Zap className="size-4" />
        {isExecuting ? "Simulating…" : "Execute"}
      </Button>
    </TerminalPanel>
  );
}
