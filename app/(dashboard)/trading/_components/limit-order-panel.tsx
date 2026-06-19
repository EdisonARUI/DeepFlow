"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { alignHumanBaseAmountToLot, computeBaseQuantityFromQuotePay } from "@deepflow/sdk";
import type { LimitOrderSide, LimitExpirePreset } from "@deepflow/sdk/trade";
import type {
  LimitOrderQuoteView,
  TradeFundLocation,
  TradingMarketView,
} from "@/lib/data/trading/types";
import { formatLiquidityBalance } from "@/lib/data/liquidity/liquidity-formatters";
import {
  computeLimitPayAmount,
  computeLimitReceiveEst,
  formatLimitRateLabel,
  getLimitDisplayAssets,
} from "./trading-utils";
import { LimitExpireSelect } from "./limit-expire-select";
import { LimitRateBlock } from "./limit-rate-block";
import { SwapAmountBlock } from "./swap-amount-block";
import { SwapExecutionInfo } from "./swap-execution-info";
import { SwapSegmentedControl } from "./swap-segmented-control";
import { TradeDirectionFlip } from "./trade-direction-flip";
import type { LimitOrderSimulationStatus } from "@/lib/data/trading/use-limit-order-simulation";
import { getTransactionExplorerUrl } from "@/lib/sui/explorer";

type LimitOrderPanelProps = {
  market: TradingMarketView;
  limitSide: LimitOrderSide;
  onLimitSideChange: (side: LimitOrderSide) => void;
  fromAmount: string;
  onFromAmountChange: (value: string) => void;
  limitPrice: string;
  onLimitPriceChange: (value: string) => void;
  limitExpirePreset: LimitExpirePreset;
  onLimitExpirePresetChange: (value: LimitExpirePreset) => void;
  fundSource: TradeFundLocation;
  onFundSourceChange: (value: TradeFundLocation) => void;
  payBalance: bigint;
  payDecimals: number;
  receiveBalance: bigint;
  receiveDecimals: number;
  baseDecimals: number;
  quoteDecimals: number;
  limitQuote: LimitOrderQuoteView | null;
  executeStatus?: LimitOrderSimulationStatus;
  txDigest?: string;
  executionNote?: string;
};

export function LimitOrderPanel({
  market,
  limitSide,
  onLimitSideChange,
  fromAmount,
  onFromAmountChange,
  limitPrice,
  onLimitPriceChange,
  limitExpirePreset,
  onLimitExpirePresetChange,
  fundSource,
  onFundSourceChange,
  payBalance,
  payDecimals,
  receiveBalance,
  receiveDecimals,
  baseDecimals,
  quoteDecimals,
  limitQuote,
  executeStatus,
  txDigest,
  executionNote,
}: LimitOrderPanelProps) {
  const { payAsset, receiveAsset } = useMemo(
    () => getLimitDisplayAssets(market, limitSide),
    [limitSide, market],
  );

  const [buyPayDraft, setBuyPayDraft] = useState("");
  const prevLimitSideRef = useRef(limitSide);

  const baseQuantity = parseFloat(fromAmount) || 0;
  const limitPriceNumber = parseFloat(limitPrice) || 0;
  const receiveEst = computeLimitReceiveEst(limitSide, baseQuantity, limitPriceNumber);

  useEffect(() => {
    if (fromAmount === "") {
      setBuyPayDraft("");
    }
  }, [fromAmount, market.poolKey]);

  useEffect(() => {
    const prevLimitSide = prevLimitSideRef.current;
    prevLimitSideRef.current = limitSide;

    if (limitSide === "SELL") {
      setBuyPayDraft("");
      return;
    }

    if (prevLimitSide === "SELL" && fromAmount && limitPriceNumber > 0) {
      const pay = computeLimitPayAmount("BUY", baseQuantity, limitPriceNumber);
      setBuyPayDraft(pay > 0 ? pay.toFixed(4) : "");
    }
  }, [baseQuantity, fromAmount, limitPriceNumber, limitSide]);

  const payBalanceLabel = `BALANCE: ${formatLiquidityBalance(payBalance, payDecimals)} ${payAsset}`;
  const receiveBalanceLabel = `BALANCE: ${formatLiquidityBalance(receiveBalance, receiveDecimals)} ${receiveAsset}`;

  const handleToggleSide = () => {
    onLimitSideChange(limitSide === "BUY" ? "SELL" : "BUY");
  };

  const handlePayAmountChange = (value: string) => {
    const lotBaseUnits =
      limitQuote?.lotBaseUnits && limitQuote.lotBaseUnits > 0n
        ? limitQuote.lotBaseUnits
        : undefined;

    if (limitSide === "SELL") {
      onFromAmountChange(alignHumanBaseAmountToLot(value, baseDecimals, lotBaseUnits));
      return;
    }

    setBuyPayDraft(value);
    if (limitPrice.trim() && value.trim()) {
      onFromAmountChange(
        computeBaseQuantityFromQuotePay(
          value,
          limitPrice,
          quoteDecimals,
          baseDecimals,
          lotBaseUnits,
        ),
      );
      return;
    }
    onFromAmountChange("");
  };

  const payFieldAmount = limitSide === "SELL" ? fromAmount : buyPayDraft;
  const receiveFieldAmount =
    receiveEst > 0 ? receiveEst.toFixed(4) : "";

  const minOrderHint = limitQuote?.minOrderLabel;

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
        hintLabel={minOrderHint}
        amount={payFieldAmount}
        onAmountChange={handlePayAmountChange}
        asset={payAsset}
      />

      <TradeDirectionFlip
        onClick={handleToggleSide}
        ariaLabel="Toggle limit order side"
      />

      <SwapAmountBlock
        label="RECEIVE (EST)"
        balanceLabel={receiveBalanceLabel}
        amount={receiveFieldAmount}
        readOnly
        asset={receiveAsset}
      />

      <LimitRateBlock
        side={limitSide}
        baseAsset={market.baseAsset}
        quoteAsset={market.quoteAsset}
        price={limitPrice}
        onPriceChange={onLimitPriceChange}
        onToggleSide={handleToggleSide}
      />

      <LimitExpireSelect
        value={limitExpirePreset}
        onChange={onLimitExpirePresetChange}
      />

      <SwapExecutionInfo
        rateLabel={formatLimitRateLabel(market, limitPrice)}
        feeLabel={limitQuote?.makerFeeLabel ?? "—"}
      />

      {executeStatus === "executed" && txDigest ? (
        <p className="text-[12px] text-accent-green">
          {executionNote ? `${executionNote}: ` : "Transaction submitted: "}
          <a
            href={getTransactionExplorerUrl(txDigest)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan underline"
          >
            {txDigest.length <= 12
              ? txDigest
              : `${txDigest.slice(0, 6)}...${txDigest.slice(-4)}`}
          </a>
        </p>
      ) : null}
    </>
  );
}
