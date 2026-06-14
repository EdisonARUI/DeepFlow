"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useLiquidityPositions } from "@/lib/data/liquidity/use-liquidity-positions";
import {
  findPositionForLocation,
  resolveBalanceForLocation,
} from "@/lib/data/trading/resolve-trade-execution";
import type { TradeFundLocation } from "@/lib/data/trading/types";
import { useDeepbookOrders } from "@/lib/data/trading/use-deepbook-orders";
import { useTradeSimulation } from "@/lib/data/trading/use-trade-simulation";
import { useTradingMarkets } from "@/lib/data/trading/use-trading-markets";
import { getSwapAssets } from "./trading-utils";
import { DeepbookOrders } from "./deepbook-orders";
import { MarketPairs } from "./market-pairs";
import { SwapWidget } from "./swap-widget";

export function TradingWorkspace() {
  const account = useCurrentAccount();
  const { markets, isLoading: marketsLoading, error: marketsError } = useTradingMarkets();
  const [selectedPoolKey, setSelectedPoolKey] = useState("");
  const [isReversed, setIsReversed] = useState(false);
  const [fromAmount, setFromAmount] = useState("");
  const [fundSource, setFundSource] = useState<TradeFundLocation>("wallet");
  const [fundDestination, setFundDestination] = useState<TradeFundLocation>("wallet");

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
    status: executeStatus,
    error: executeError,
    refreshQuote,
    simulate,
    reset: resetSimulation,
  } = useTradeSimulation();

  const { from: fromAsset, to: toAsset } = useMemo(() => {
    if (!selectedMarket) return { from: undefined, to: undefined };
    return getSwapAssets(selectedMarket, isReversed);
  }, [selectedMarket, isReversed]);

  const payPosition = useMemo(() => {
    if (!fromAsset) return undefined;
    return findPositionForLocation(fundSource, fromAsset, positions);
  }, [fromAsset, fundSource, positions]);

  const receivePosition = useMemo(() => {
    if (!toAsset) return undefined;
    return findPositionForLocation(fundDestination, toAsset, positions);
  }, [fundDestination, positions, toAsset]);

  const payBalance = useMemo(() => {
    if (!fromAsset) return 0n;
    return resolveBalanceForLocation(fundSource, fromAsset, positions);
  }, [fromAsset, fundSource, positions]);

  const receiveBalance = useMemo(() => {
    if (!toAsset) return 0n;
    return resolveBalanceForLocation(fundDestination, toAsset, positions);
  }, [fundDestination, positions, toAsset]);

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
  }, [selectedPoolKey, isReversed, fundSource, fundDestination, resetSimulation]);

  const handleExecute = useCallback(() => {
    if (!selectedMarket || !fromAsset || !toAsset) return;

    void simulate({
      market: selectedMarket,
      fromAmount,
      isReversed,
      fundSource,
      fundDestination,
      payBalance,
      payDecimals: payPosition?.decimals ?? 9,
      fromAsset,
      toAsset,
    });
  }, [
    fromAmount,
    fromAsset,
    fundDestination,
    fundSource,
    isReversed,
    payBalance,
    payPosition?.decimals,
    selectedMarket,
    simulate,
    toAsset,
  ]);

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
          fundSource={fundSource}
          fundDestination={fundDestination}
          onFundSourceChange={setFundSource}
          onFundDestinationChange={setFundDestination}
          payBalance={payBalance}
          payDecimals={payPosition?.decimals ?? 9}
          receiveBalance={receiveBalance}
          receiveDecimals={receivePosition?.decimals ?? 6}
          quote={quote}
          onExecute={handleExecute}
          executeStatus={executeStatus}
          executeError={executeError}
        />
        <DeepbookOrders
          orders={orders}
          isLoading={ordersLoading}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
}
