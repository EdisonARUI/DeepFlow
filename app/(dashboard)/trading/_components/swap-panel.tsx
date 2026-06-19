"use client";

import { useMemo } from "react";
import type {
  TradeFundLocation,
  TradeQuoteView,
  TradingMarketView,
} from "@/lib/data/trading/types";
import { formatLiquidityBalance } from "@/lib/data/liquidity/liquidity-formatters";
import { computeToAmount, getSwapAssets } from "./trading-utils";
import { SwapAmountBlock } from "./swap-amount-block";
import { SwapExecutionInfo } from "./swap-execution-info";
import { SwapSegmentedControl } from "./swap-segmented-control";
import { TradeDirectionFlip } from "./trade-direction-flip";

type SwapPanelProps = {
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
};

export function SwapPanel({
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
}: SwapPanelProps) {
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

  const payBalanceLabel = `BALANCE: ${formatLiquidityBalance(payBalance, payDecimals)} ${from}`;
  const receiveBalanceLabel = `BALANCE: ${formatLiquidityBalance(receiveBalance, receiveDecimals)} ${to}`;

  return (
    <>
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

      <TradeDirectionFlip onClick={onToggleDirection} ariaLabel="Swap direction" />

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
    </>
  );
}
