"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useLiquidityPositions } from "@/lib/data/liquidity/use-liquidity-positions";
import { resolveTradingWriteMode } from "@/lib/data/trading/resolve-trading-write-mode";
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

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`rounded-[28px] bg-white/5 ${className ?? ""}`.trim()} aria-hidden />
  );
}

function TradingWorkspaceSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5 rounded-[45px] bg-bg-dashboard-shell p-5">
      <SkeletonCard className="h-10 w-full" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[5fr_6fr_5fr]">
        <SkeletonCard className="h-[520px]" />
        <SkeletonCard className="h-[520px]" />
        <SkeletonCard className="h-[520px]" />
      </div>
    </div>
  );
}

function TradingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 rounded-[45px] bg-bg-dashboard-shell p-5">{children}</div>
  );
}

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

  const { positions, isLoading: positionsLoading, refetch: refetchPositions } =
    useLiquidityPositions();

  const writeMode = resolveTradingWriteMode();

  const {
    quote,
    status: executeStatus,
    error: executeError,
    txDigest,
    refreshQuote,
    simulate,
    reset: resetSimulation,
  } = useTradeSimulation({
    onExecuted: () => refetchPositions({ bustCache: true }),
  });

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
      payDecimals: payPosition?.decimals ?? 9,
    });
  }, [fromAmount, isReversed, payPosition?.decimals, refreshQuote, selectedMarket]);

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
    return <TradingWorkspaceSkeleton />;
  }

  if (marketsError || !selectedMarket) {
    return (
      <TradingShell>
        <p className="text-sm text-text-muted">
          Failed to load markets{marketsError ? `: ${marketsError.message}` : ""}
        </p>
      </TradingShell>
    );
  }

  return (
    <TradingShell>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[5fr_6fr_5fr]">
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
          txDigest={txDigest}
          writeMode={writeMode}
        />
        <DeepbookOrders
          orders={orders}
          isLoading={ordersLoading}
          emptyMessage={emptyMessage}
        />
      </div>
    </TradingShell>
  );
}
