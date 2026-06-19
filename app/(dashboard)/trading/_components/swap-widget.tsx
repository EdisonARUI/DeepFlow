"use client";

import { DashboardPanel } from "@/components/dashboard-panel";
import type { LimitOrderSide, LimitExpirePreset } from "@deepflow/sdk/trade";
import type {
  LimitOrderQuoteView,
  TradeFundLocation,
  TradeQuoteView,
  TradingMarketView,
} from "@/lib/data/trading/types";
import type { TradeSimulationStatus } from "@/lib/data/trading/use-trade-simulation";
import type { LimitOrderSimulationStatus } from "@/lib/data/trading/use-limit-order-simulation";
import { LimitOrderPanel } from "./limit-order-panel";
import { SwapPanel } from "./swap-panel";
import { SwapModeToggle, type TradeMode } from "./swap-mode-toggle";
import { TradeWidgetFooter } from "./trade-widget-footer";

type SwapWidgetProps = {
  market: TradingMarketView;
  tradeMode: TradeMode;
  onTradeModeChange: (mode: TradeMode) => void;
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
  limitSide: LimitOrderSide;
  onLimitSideChange: (side: LimitOrderSide) => void;
  limitPrice: string;
  onLimitPriceChange: (value: string) => void;
  limitExpirePreset: LimitExpirePreset;
  onLimitExpirePresetChange: (value: LimitExpirePreset) => void;
  limitQuote: LimitOrderQuoteView | null;
  onLimitExecute: () => void;
  limitExecuteStatus: LimitOrderSimulationStatus;
  limitExecuteError?: string;
  limitTxDigest?: string;
  limitExecutionNote?: string;
  limitPayBalance: bigint;
  limitPayDecimals: number;
  limitReceiveBalance: bigint;
  limitReceiveDecimals: number;
  limitBaseDecimals: number;
  limitQuoteDecimals: number;
};

export function SwapWidget({
  market,
  tradeMode,
  onTradeModeChange,
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
  limitSide,
  onLimitSideChange,
  limitPrice,
  onLimitPriceChange,
  limitExpirePreset,
  onLimitExpirePresetChange,
  limitQuote,
  onLimitExecute,
  limitExecuteStatus,
  limitExecuteError,
  limitTxDigest,
  limitExecutionNote,
  limitPayBalance,
  limitPayDecimals,
  limitReceiveBalance,
  limitReceiveDecimals,
  limitBaseDecimals,
  limitQuoteDecimals,
}: SwapWidgetProps) {
  const isSwapBusy = executeStatus === "simulating" || executeStatus === "executing";
  const isLimitBusy =
    limitExecuteStatus === "simulating" || limitExecuteStatus === "executing";
  const isBusy = tradeMode === "swap" ? isSwapBusy : isLimitBusy;

  const activeError = tradeMode === "swap" ? executeError : limitExecuteError;
  const activeStatus = tradeMode === "swap" ? executeStatus : limitExecuteStatus;

  return (
    <DashboardPanel
      title="DEEPBOOK"
      className="h-full min-h-[500px] xl:min-h-[795px]"
      contentClassName="flex min-h-0 flex flex-col justify-between gap-5"
      actions={<SwapModeToggle value={tradeMode} onChange={onTradeModeChange} />}
    >
      <div className="flex flex flex-col gap-3">
        {tradeMode === "swap" ? (
          <SwapPanel
            market={market}
            isReversed={isReversed}
            onToggleDirection={onToggleDirection}
            fromAmount={fromAmount}
            onFromAmountChange={onFromAmountChange}
            fundSource={fundSource}
            fundDestination={fundDestination}
            onFundSourceChange={onFundSourceChange}
            onFundDestinationChange={onFundDestinationChange}
            payBalance={payBalance}
            payDecimals={payDecimals}
            receiveBalance={receiveBalance}
            receiveDecimals={receiveDecimals}
            quote={quote}
          />
        ) : (
          <LimitOrderPanel
            market={market}
            limitSide={limitSide}
            onLimitSideChange={onLimitSideChange}
            fromAmount={fromAmount}
            onFromAmountChange={onFromAmountChange}
            limitPrice={limitPrice}
            onLimitPriceChange={onLimitPriceChange}
            limitExpirePreset={limitExpirePreset}
            onLimitExpirePresetChange={onLimitExpirePresetChange}
            fundSource={fundSource}
            onFundSourceChange={onFundSourceChange}
            payBalance={limitPayBalance}
            payDecimals={limitPayDecimals}
            receiveBalance={limitReceiveBalance}
            receiveDecimals={limitReceiveDecimals}
            baseDecimals={limitBaseDecimals}
            quoteDecimals={limitQuoteDecimals}
            limitQuote={limitQuote}
            executeStatus={limitExecuteStatus}
            txDigest={limitTxDigest}
            executionNote={limitExecutionNote}
          />
        )}
      </div>

      <TradeWidgetFooter
        error={activeError}
        status={activeStatus}
        txDigest={tradeMode === "swap" ? txDigest : undefined}
        isBusy={isBusy}
        onExecute={tradeMode === "swap" ? onExecute : onLimitExecute}
      />
    </DashboardPanel>
  );
}
