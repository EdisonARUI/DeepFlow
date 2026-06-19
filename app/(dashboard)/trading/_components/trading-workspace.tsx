"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import {
  resolveExpireTimestampMs,
  resolveLimitOrderAssets,
  type LimitExpirePreset,
  type LimitOrderSide,
} from "@deepflow/sdk/trade";
import { useLiquidityPositions } from "@/lib/data/liquidity/use-liquidity-positions";
import {
  findPositionForLocation,
  resolveBalanceForLocation,
} from "@/lib/data/trading/resolve-trade-execution";
import type { TradeFundLocation } from "@/lib/data/trading/types";
import { useCancelDeepbookOrder } from "@/lib/data/trading/use-cancel-deepbook-order";
import { useDeepbookOpenOrders } from "@/lib/data/trading/use-deepbook-open-orders";
import { useLimitOrderSimulation } from "@/lib/data/trading/use-limit-order-simulation";
import { useOrderHistory } from "@/lib/data/trading/use-order-history";
import { useTradeSimulation } from "@/lib/data/trading/use-trade-simulation";
import { useTradingMarkets } from "@/lib/data/trading/use-trading-markets";
import { getLimitDisplayAssets, getSwapAssets } from "./trading-utils";
import { MarketPairs } from "./market-pairs";
import { OrdersPanel } from "./orders-panel";
import { SwapWidget } from "./swap-widget";
import type { TradeMode } from "./swap-mode-toggle";

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
  const [tradeMode, setTradeMode] = useState<TradeMode>("swap");
  const [isReversed, setIsReversed] = useState(false);
  const [fromAmount, setFromAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [limitSide, setLimitSide] = useState<LimitOrderSide>("SELL");
  const [limitExpirePreset, setLimitExpirePreset] = useState<LimitExpirePreset>("7d");
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

  useEffect(() => {
    if (!selectedMarket) return;
    setLimitPrice(selectedMarket.price);
    setFromAmount("");
  }, [selectedMarket?.poolKey, selectedMarket]);

  const {
    orders: historyOrders,
    emptyMessage: historyEmptyMessage,
    isLoading: historyLoading,
    refetch: refetchOrderHistory,
    refetchAfterExecution: refetchOrderHistoryAfterExecution,
  } = useOrderHistory();

  const {
    orders: openOrders,
    managerId,
    emptyMessage: openEmptyMessage,
    isLoading: openOrdersLoading,
    refetch: refetchOpenOrders,
  } = useDeepbookOpenOrders();

  const { positions, isLoading: positionsLoading, refetch: refetchPositions } =
    useLiquidityPositions();

  const handleSwapExecuted = useCallback(
    (digest: string) => {
      refetchPositions({ bustCache: true, silent: true });
      void refetchOrderHistoryAfterExecution(digest);
    },
    [refetchOrderHistoryAfterExecution, refetchPositions],
  );

  const handleLimitOrderExecuted = useCallback(() => {
    void refetchOpenOrders();
    void refetchOrderHistory();
    if (fundSource === "navi" || fundSource === "suilend") {
      refetchPositions({ bustCache: true, silent: true });
    }
  }, [fundSource, refetchOpenOrders, refetchOrderHistory, refetchPositions]);

  const {
    quote,
    status: executeStatus,
    error: executeError,
    txDigest,
    refreshQuote,
    simulate,
    reset: resetSimulation,
  } = useTradeSimulation({
    onExecuted: handleSwapExecuted,
  });

  const {
    quote: limitQuote,
    status: limitExecuteStatus,
    error: limitExecuteError,
    txDigest: limitTxDigest,
    executionNote: limitExecutionNote,
    refreshQuote: refreshLimitQuote,
    simulate: simulateLimitOrder,
    reset: resetLimitSimulation,
  } = useLimitOrderSimulation({
    onExecuted: handleLimitOrderExecuted,
  });

  const {
    cancelOrder,
    cancelAllOrdersForPools,
    status: cancelStatus,
  } = useCancelDeepbookOrder({
    onExecuted: () => {
      void refetchOpenOrders();
      void refetchOrderHistory();
    },
  });

  const { from: fromAsset, to: toAsset } = useMemo(() => {
    if (!selectedMarket) return { from: undefined, to: undefined };
    return getSwapAssets(selectedMarket, isReversed);
  }, [selectedMarket, isReversed]);

  const limitDisplayAssets = useMemo(() => {
    if (!selectedMarket) {
      return {
        payAsset: undefined as string | undefined,
        receiveAsset: undefined as string | undefined,
      };
    }
    return getLimitDisplayAssets(selectedMarket, limitSide);
  }, [limitSide, selectedMarket]);

  const limitAssets = useMemo(() => {
    if (!selectedMarket) {
      return {
        depositAsset: undefined as string | undefined,
        baseAsset: undefined as string | undefined,
      };
    }
    return resolveLimitOrderAssets(selectedMarket.poolKey, limitSide);
  }, [limitSide, selectedMarket]);

  const payPosition = useMemo(() => {
    if (!fromAsset) return undefined;
    return findPositionForLocation(fundSource, fromAsset, positions);
  }, [fromAsset, fundSource, positions]);

  const receivePosition = useMemo(() => {
    if (!toAsset) return undefined;
    return findPositionForLocation(fundDestination, toAsset, positions);
  }, [fundDestination, positions, toAsset]);

  const limitPayPosition = useMemo(() => {
    if (!limitDisplayAssets.payAsset) return undefined;
    return findPositionForLocation(fundSource, limitDisplayAssets.payAsset, positions);
  }, [fundSource, limitDisplayAssets.payAsset, positions]);

  const limitReceivePosition = useMemo(() => {
    if (!limitDisplayAssets.receiveAsset) return undefined;
    return findPositionForLocation(fundSource, limitDisplayAssets.receiveAsset, positions);
  }, [fundSource, limitDisplayAssets.receiveAsset, positions]);

  const payBalance = useMemo(() => {
    if (!fromAsset) return 0n;
    return resolveBalanceForLocation(fundSource, fromAsset, positions);
  }, [fromAsset, fundSource, positions]);

  const receiveBalance = useMemo(() => {
    if (!toAsset) return 0n;
    return resolveBalanceForLocation(fundDestination, toAsset, positions);
  }, [fundDestination, positions, toAsset]);

  const limitDepositBalance = useMemo(() => {
    if (!limitAssets.depositAsset) return 0n;
    return resolveBalanceForLocation(fundSource, limitAssets.depositAsset, positions);
  }, [fundSource, limitAssets.depositAsset, positions]);

  const limitPayBalance = useMemo(() => {
    if (!limitDisplayAssets.payAsset) return 0n;
    return resolveBalanceForLocation(fundSource, limitDisplayAssets.payAsset, positions);
  }, [fundSource, limitDisplayAssets.payAsset, positions]);

  const limitReceiveBalance = useMemo(() => {
    if (!limitDisplayAssets.receiveAsset) return 0n;
    return resolveBalanceForLocation(fundSource, limitDisplayAssets.receiveAsset, positions);
  }, [fundSource, limitDisplayAssets.receiveAsset, positions]);

  const baseDecimals = useMemo(() => {
    if (!selectedMarket) return 9;
    const basePosition = findPositionForLocation("wallet", selectedMarket.baseAsset, positions);
    return basePosition?.decimals ?? (selectedMarket.baseAsset === "SUI" ? 9 : 6);
  }, [positions, selectedMarket]);

  const quoteDecimals = useMemo(() => {
    if (!selectedMarket) return 9;
    const quotePosition = findPositionForLocation("wallet", selectedMarket.quoteAsset, positions);
    return quotePosition?.decimals ?? (selectedMarket.quoteAsset === "SUI" ? 9 : 6);
  }, [positions, selectedMarket]);

  const limitPayDecimals = limitPayPosition?.decimals ?? 6;
  const limitReceiveDecimals = limitReceivePosition?.decimals ?? 6;

  const limitExpireAtMs = useMemo(
    () => resolveExpireTimestampMs(limitExpirePreset),
    [limitExpirePreset],
  );

  useEffect(() => {
    if (!selectedMarket || tradeMode !== "swap") return;
    void refreshQuote({
      market: selectedMarket,
      fromAmount,
      isReversed,
      payDecimals: payPosition?.decimals ?? 9,
    });
  }, [fromAmount, isReversed, payPosition?.decimals, refreshQuote, selectedMarket, tradeMode]);

  useEffect(() => {
    if (!selectedMarket || tradeMode !== "limit") return;
    void refreshLimitQuote({
      market: selectedMarket,
      side: limitSide,
      price: limitPrice,
      quantity: fromAmount,
      quantityDecimals: baseDecimals,
    });
  }, [
    baseDecimals,
    fromAmount,
    limitPrice,
    limitSide,
    refreshLimitQuote,
    selectedMarket,
    tradeMode,
  ]);

  useEffect(() => {
    resetSimulation();
    resetLimitSimulation();
  }, [
    selectedPoolKey,
    isReversed,
    fundSource,
    fundDestination,
    tradeMode,
    limitSide,
    limitExpirePreset,
    resetLimitSimulation,
    resetSimulation,
  ]);

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

  const handleLimitExecute = useCallback(() => {
    if (!selectedMarket) return;

    void simulateLimitOrder({
      market: selectedMarket,
      side: limitSide,
      price: limitPrice,
      quantity: fromAmount,
      quantityDecimals: baseDecimals,
      fundSource,
      payBalance: limitDepositBalance,
      expireAtMs: limitExpireAtMs,
    });
  }, [
    baseDecimals,
    fromAmount,
    fundSource,
    limitDepositBalance,
    limitExpireAtMs,
    limitPrice,
    limitSide,
    selectedMarket,
    simulateLimitOrder,
  ]);

  const handleCancelOrder = useCallback(
    (orderId: string, poolKey: string) => {
      if (!managerId) return;
      void cancelOrder({
        poolKey,
        managerId,
        orderId,
      });
    },
    [cancelOrder, managerId],
  );

  const handleCancelAll = useCallback(() => {
    if (!managerId || openOrders.length === 0) return;
    const poolKeys = [...new Set(openOrders.map((order) => order.poolKey))];
    const message =
      poolKeys.length === 1
        ? `Cancel all open limit orders for ${poolKeys[0]}?`
        : `Cancel all open limit orders across ${poolKeys.length} markets? This may require multiple wallet signatures.`;
    if (!window.confirm(message)) return;
    void cancelAllOrdersForPools({
      poolKeys,
      managerId,
    });
  }, [cancelAllOrdersForPools, managerId, openOrders]);

  if (marketsLoading || (positionsLoading && positions.length === 0)) {
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
          tradeMode={tradeMode}
          onTradeModeChange={setTradeMode}
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
          limitSide={limitSide}
          onLimitSideChange={setLimitSide}
          limitPrice={limitPrice}
          onLimitPriceChange={setLimitPrice}
          limitExpirePreset={limitExpirePreset}
          onLimitExpirePresetChange={setLimitExpirePreset}
          limitQuote={limitQuote}
          onLimitExecute={handleLimitExecute}
          limitExecuteStatus={limitExecuteStatus}
          limitExecuteError={limitExecuteError}
          limitTxDigest={limitTxDigest}
          limitExecutionNote={limitExecutionNote}
          limitPayBalance={limitPayBalance}
          limitPayDecimals={limitPayDecimals}
          limitReceiveBalance={limitReceiveBalance}
          limitReceiveDecimals={limitReceiveDecimals}
          limitBaseDecimals={baseDecimals}
          limitQuoteDecimals={quoteDecimals}
        />
        <OrdersPanel
          historyOrders={historyOrders}
          openOrders={openOrders}
          isLoadingHistory={historyLoading}
          isLoadingOpen={openOrdersLoading}
          historyEmptyMessage={historyEmptyMessage}
          openEmptyMessage={openEmptyMessage}
          managerId={managerId}
          onCancelOrder={account?.address ? handleCancelOrder : undefined}
          onCancelAll={account?.address ? handleCancelAll : undefined}
          cancelStatus={cancelStatus}
        />
      </div>
    </TradingShell>
  );
}
