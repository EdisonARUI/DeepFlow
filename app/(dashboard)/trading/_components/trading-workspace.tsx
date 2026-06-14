"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { buildIdlePipelineSteps } from "@deepflow/sdk/trade";
import { useLiquidityPositions } from "@/lib/data/liquidity/use-liquidity-positions";
import { useDeepbookOrders } from "@/lib/data/trading/use-deepbook-orders";
import { useTradeSimulation } from "@/lib/data/trading/use-trade-simulation";
import { useTradingMarkets } from "@/lib/data/trading/use-trading-markets";
import type { PtbStepView } from "@/lib/data/trading/types";
import { getSwapAssets } from "./trading-utils";
import { DeepbookOrders } from "./deepbook-orders";
import { MarketPairs } from "./market-pairs";
import { PtbPipeline } from "./ptb-pipeline";
import { SwapWidget } from "./swap-widget";

const CREDIT_SOURCES = [{ id: "navi", label: "NAVI" }] as const;

export function TradingWorkspace() {
  const account = useCurrentAccount();
  const { markets, isLoading: marketsLoading, error: marketsError } = useTradingMarkets();
  const [selectedPoolKey, setSelectedPoolKey] = useState("");
  const [isReversed, setIsReversed] = useState(false);
  const [fromAmount, setFromAmount] = useState("100.00");
  const [selectedCreditSourceId] = useState<string>(CREDIT_SOURCES[0].id);

  const selectedMarket = useMemo(
    () => markets.find((m) => m.poolKey === selectedPoolKey) ?? markets[0],
    [markets, selectedPoolKey],
  );

  useEffect(() => {
    if (!selectedPoolKey && markets[0]) {
      setSelectedPoolKey(markets[0].poolKey);
    }
  }, [markets, selectedPoolKey]);

  const { orders, emptyMessage, isLoading: ordersLoading } = useDeepbookOrders(
    selectedMarket?.poolKey,
  );

  const { positions, isLoading: positionsLoading } = useLiquidityPositions();

  const {
    quote,
    pipelineSteps,
    status: executeStatus,
    error: executeError,
    refreshQuote,
    simulate,
    reset: resetSimulation,
  } = useTradeSimulation();

  const fromAsset = useMemo(() => {
    if (!selectedMarket) return undefined;
    return getSwapAssets(selectedMarket, isReversed).from;
  }, [selectedMarket, isReversed]);

  const creditPosition = useMemo(() => {
    if (!fromAsset) return undefined;
    return positions.find(
      (p) =>
        p.asset.toUpperCase() === fromAsset.toUpperCase() &&
        p.protocol.toLowerCase().includes(selectedCreditSourceId),
    );
  }, [fromAsset, positions, selectedCreditSourceId]);

  useEffect(() => {
    if (!selectedMarket) return;
    void refreshQuote({
      market: selectedMarket,
      fromAmount,
      isReversed,
    });
  }, [fromAmount, isReversed, refreshQuote, selectedMarket]);

  useEffect(() => {
    resetSimulation();
  }, [selectedPoolKey, isReversed, resetSimulation]);

  const handleExecute = useCallback(() => {
    if (!selectedMarket) return;

    void simulate({
      market: selectedMarket,
      fromAmount,
      isReversed,
      creditPosition: creditPosition
        ? {
            asset: creditPosition.asset,
            suppliedBalance: creditPosition.suppliedBalance,
            walletCoinBalance: creditPosition.walletCoinBalance,
            protocol: creditPosition.protocol,
            decimals: creditPosition.decimals,
          }
        : undefined,
    });
  }, [creditPosition, fromAmount, isReversed, selectedMarket, simulate]);

  const ptbSteps: PtbStepView[] = useMemo(
    () =>
      pipelineSteps.map((step) => ({
        id: step.id,
        label: step.label,
        status: step.status,
        description: step.description,
      })),
    [pipelineSteps],
  );

  if (marketsLoading || positionsLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-4 p-4">
        <p className="text-sm text-text-muted">Loading trading data…</p>
      </div>
    );
  }

  if (marketsError || !selectedMarket) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-4 p-4">
        <p className="text-sm text-text-muted">
          Failed to load markets{marketsError ? `: ${marketsError.message}` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-4 p-4">
      {!account && (
        <p className="text-sm text-text-muted">
          连接钱包以查看个人 DeepBook 订单并执行模拟；行情数据仍可浏览。
        </p>
      )}
      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[260px_1fr_260px]">
        <MarketPairs
          markets={markets}
          selectedPoolKey={selectedMarket.poolKey}
          onSelectPoolKey={setSelectedPoolKey}
        />
        <SwapWidget
          market={selectedMarket}
          isReversed={isReversed}
          onToggleDirection={() => setIsReversed((prev) => !prev)}
          fromAmount={fromAmount}
          onFromAmountChange={setFromAmount}
          creditBalance={
            creditPosition
              ? {
                  asset: creditPosition.asset,
                  suppliedBalance: creditPosition.suppliedBalance,
                  decimals: creditPosition.decimals,
                }
              : undefined
          }
          quote={quote}
          onExecute={handleExecute}
          executeStatus={executeStatus}
          executeError={executeError}
          creditSourceLabel={CREDIT_SOURCES[0].label}
        />
        <DeepbookOrders
          orders={orders}
          isLoading={ordersLoading}
          emptyMessage={emptyMessage}
        />
      </div>
      <PtbPipeline steps={ptbSteps.length > 0 ? ptbSteps : buildIdlePipelineSteps()} />
    </div>
  );
}
