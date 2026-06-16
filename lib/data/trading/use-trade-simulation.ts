"use client";

import { useCallback, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { parseAmountToBaseUnits } from "@deepflow/sdk/amount/parse-base-units";
import {
  buildIdlePipelineSteps,
  buildNaviReturnSuccessPipelineSteps,
  buildNaviRoundTripSuccessPipelineSteps,
  buildNaviSuilendSwapSuccessPipelineSteps,
  buildSuilendNaviSwapSuccessPipelineSteps,
  buildSuilendReturnSuccessPipelineSteps,
  buildSuilendRoundTripSuccessPipelineSteps,
  buildWalletNaviSwapSuccessPipelineSteps,
  buildWalletSuilendSwapSuccessPipelineSteps,
  buildWalletSwapSuccessPipelineSteps,
  deepbookQuoteFromHuman,
  resolveOutputDecimals,
  simulateTradeNaviReturn,
  simulateTradeNaviRoundTrip,
  simulateTradeNaviSuilend,
  simulateTradeSuilendNavi,
  simulateTradeSuilendReturn,
  simulateTradeSuilendRoundTrip,
  simulateTradeWalletNavi,
  simulateTradeWalletSuilend,
  simulateTradeWalletSwap,
} from "@deepflow/sdk/trade";
import type { PipelineStep } from "@deepflow/sdk/trade";
import { createTradingRepository } from "./create-trading-repository";
import {
  assertSupportedTradePool,
  assertValidSwapAssets,
  resolveTradeExecutionRoute,
} from "./resolve-trade-execution";
import type { TradeExecutionRoute, TradeFundLocation, TradingMarketView, TradeQuoteView } from "./types";

export type TradeSimulationStatus = "idle" | "simulating" | "success" | "error";

/** Reserve SUI for gas when wallet is the pay source (useGasCoin merge). */
const WALLET_GAS_RESERVE = 500_000_000n;

const WALLET_SOURCE_ROUTES = new Set<TradeExecutionRoute>([
  "wallet_wallet",
  "wallet_navi",
  "wallet_suilend",
]);

type SimulateParams = {
  market: TradingMarketView;
  fromAmount: string;
  isReversed: boolean;
  fundSource: TradeFundLocation;
  fundDestination: TradeFundLocation;
  payBalance: bigint;
  payDecimals: number;
  fromAsset: string;
  toAsset: string;
};

function humanAmountFromBaseUnits(baseUnits: bigint, decimals: number): number {
  return Number(baseUnits) / 10 ** decimals;
}

function formatSimulationError(message: string): string {
  if (message.includes("minOutput must be positive") || message.includes("minUsdcOut must be positive")) {
    return "无法获取有效 DeepBook 报价，请稍后重试或调整交易数量";
  }
  if (message.includes('"abortCode":"1502"') || message.includes("abort code: 1502")) {
    return "Navi 链上价格状态过期，请重试";
  }
  if (message.includes("No Suilend obligation found")) {
    return "请先在 Suilend 存入资产，或于 Liquidity 页执行 Supply";
  }
  return message;
}

function markRouteError(
  steps: PipelineStep[],
  errorStepIndex: number,
): PipelineStep[] {
  return steps.map((step, index) => {
    if (index < errorStepIndex) {
      return { ...step, status: "done" as const };
    }
    if (index === errorStepIndex) {
      return { ...step, status: "error" as const };
    }
    return step;
  });
}

export function useTradeSimulation() {
  const account = useCurrentAccount();
  const repository = useMemo(() => createTradingRepository(), []);
  const [status, setStatus] = useState<TradeSimulationStatus>("idle");
  const [error, setError] = useState<string | undefined>();
  const [quote, setQuote] = useState<TradeQuoteView | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(
    buildIdlePipelineSteps(),
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(undefined);
    setPipelineSteps(buildIdlePipelineSteps());
  }, []);

  const refreshQuote = useCallback(
    async (params: Pick<SimulateParams, "market" | "fromAmount" | "isReversed" | "payDecimals">) => {
      let baseUnits: bigint;
      try {
        baseUnits = parseAmountToBaseUnits(params.fromAmount, params.payDecimals);
      } catch {
        setQuote(null);
        return null;
      }

      const inputHuman = humanAmountFromBaseUnits(baseUnits, params.payDecimals);
      const isSellBase = !params.isReversed;

      try {
        const nextQuote = await repository.getMarketQuote({
          poolKey: params.market.poolKey,
          inputAmount: inputHuman,
          isSellBase,
        });
        setQuote(nextQuote);
        return nextQuote;
      } catch {
        setQuote(null);
        return null;
      }
    },
    [repository],
  );

  const simulate = useCallback(
    async (params: SimulateParams) => {
      const {
        market,
        fromAmount,
        isReversed,
        fundSource,
        fundDestination,
        payBalance,
        payDecimals,
        fromAsset,
        toAsset,
      } = params;

      if (!account?.address) {
        setStatus("error");
        setError("请先连接钱包");
        return;
      }

      const poolError = assertSupportedTradePool(market.poolKey);
      if (poolError) {
        setStatus("error");
        setError(poolError);
        return;
      }

      const assetError = assertValidSwapAssets(
        market.poolKey,
        market.baseAsset,
        market.quoteAsset,
        fromAsset,
        toAsset,
      );
      if (assetError) {
        setStatus("error");
        setError(assetError);
        return;
      }

      let baseUnits: bigint;
      try {
        baseUnits = parseAmountToBaseUnits(fromAmount, payDecimals);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Invalid amount");
        return;
      }

      if (baseUnits <= 0n) {
        setStatus("error");
        setError("请输入有效交易数量");
        return;
      }

      const route = resolveTradeExecutionRoute(fundSource, fundDestination);
      if (route === "unsupported") {
        setStatus("error");
        setError("当前 SOURCE / DESTINATION 组合尚未支持");
        return;
      }

      if (baseUnits > payBalance) {
        const sourceLabel =
          fundSource === "wallet" ? "钱包" : fundSource.toUpperCase();
        setStatus("error");
        setError(`${sourceLabel} 内 ${fromAsset} 余额不足`);
        return;
      }

      if (
        fundSource === "wallet" &&
        fromAsset.toUpperCase() === "SUI" &&
        WALLET_SOURCE_ROUTES.has(route) &&
        baseUnits + WALLET_GAS_RESERVE > payBalance
      ) {
        setStatus("error");
        setError("请保留至少 0.5 SUI 用于 gas");
        return;
      }

      setStatus("simulating");
      setError(undefined);
      setPipelineSteps(
        buildIdlePipelineSteps().map((step, index) =>
          index === 0 ? { ...step, status: "active" } : step,
        ),
      );

      try {
        const inputHuman = humanAmountFromBaseUnits(baseUnits, payDecimals);
        const isSellBase = !isReversed;
        const liveQuote = await repository.getMarketQuote({
          poolKey: market.poolKey,
          inputAmount: inputHuman,
          isSellBase,
        });
        setQuote(liveQuote);

        const slippageBps = 50;
        const minOutputHuman =
          liveQuote.estimatedOutput * (1 - slippageBps / 10_000);

        let outputDecimals: number;
        try {
          outputDecimals = resolveOutputDecimals(toAsset);
        } catch {
          setStatus("error");
          setError(`暂不支持输出资产 ${toAsset} 的精度解析`);
          return;
        }

        const deepbookQuote = deepbookQuoteFromHuman({
          estimatedOutput: liveQuote.estimatedOutput,
          minOutput: minOutputHuman,
          deepRequired: liveQuote.deepRequired,
          feeLabel: liveQuote.feeLabel,
          slippageBps,
          outputDecimals,
        });

        if (deepbookQuote.minOutput <= 0n) {
          setStatus("error");
          setError("无法获取有效 DeepBook 报价，请稍后重试或调整交易数量");
          setPipelineSteps(
            buildIdlePipelineSteps().map((step, index) =>
              index === 0 ? { ...step, status: "error" } : step,
            ),
          );
          return;
        }

        const swapParams = {
          sender: account.address,
          poolKey: market.poolKey,
          inputAsset: fromAsset,
          outputAsset: toAsset,
          inputAmount: baseUnits,
          minOutput: deepbookQuote.minOutput,
          deepAmount: liveQuote.deepRequired,
        };

        if (route === "wallet_wallet") {
          const successSteps = buildWalletSwapSuccessPipelineSteps(fromAsset, toAsset);
          const result = await simulateTradeWalletSwap(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(formatSimulationError(result.error ?? "链上模拟失败"));
            setPipelineSteps(markRouteError(successSteps, 0));
            return;
          }

          setPipelineSteps(successSteps);
          setStatus("success");
          return;
        }

        if (route === "wallet_navi") {
          const successSteps = buildWalletNaviSwapSuccessPipelineSteps(fromAsset, toAsset);
          const result = await simulateTradeWalletNavi(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(formatSimulationError(result.error ?? "链上模拟失败"));
            setPipelineSteps(markRouteError(successSteps, 0));
            return;
          }

          setPipelineSteps(successSteps);
          setStatus("success");
          return;
        }

        if (route === "wallet_suilend") {
          const successSteps = buildWalletSuilendSwapSuccessPipelineSteps(fromAsset, toAsset);
          const result = await simulateTradeWalletSuilend(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(formatSimulationError(result.error ?? "链上模拟失败"));
            setPipelineSteps(markRouteError(successSteps, 0));
            return;
          }

          setPipelineSteps(successSteps);
          setStatus("success");
          return;
        }

        if (route === "navi_navi") {
          const successSteps = buildNaviRoundTripSuccessPipelineSteps(fromAsset, toAsset);
          const result = await simulateTradeNaviRoundTrip(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(formatSimulationError(result.error ?? "链上模拟失败"));
            setPipelineSteps(markRouteError(successSteps, 2));
            return;
          }

          setPipelineSteps(successSteps);
          setStatus("success");
          return;
        }

        if (route === "navi_wallet") {
          const successSteps = buildNaviReturnSuccessPipelineSteps(fromAsset, toAsset);
          const result = await simulateTradeNaviReturn(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(formatSimulationError(result.error ?? "链上模拟失败"));
            setPipelineSteps(markRouteError(successSteps, 2));
            return;
          }

          setPipelineSteps(successSteps);
          setStatus("success");
          return;
        }

        if (route === "navi_suilend") {
          const successSteps = buildNaviSuilendSwapSuccessPipelineSteps(fromAsset, toAsset);
          const result = await simulateTradeNaviSuilend(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(formatSimulationError(result.error ?? "链上模拟失败"));
            setPipelineSteps(markRouteError(successSteps, 2));
            return;
          }

          setPipelineSteps(successSteps);
          setStatus("success");
          return;
        }

        if (route === "suilend_suilend") {
          const successSteps = buildSuilendRoundTripSuccessPipelineSteps(fromAsset, toAsset);
          const result = await simulateTradeSuilendRoundTrip(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(formatSimulationError(result.error ?? "链上模拟失败"));
            setPipelineSteps(markRouteError(successSteps, 2));
            return;
          }

          setPipelineSteps(successSteps);
          setStatus("success");
          return;
        }

        if (route === "suilend_wallet") {
          const successSteps = buildSuilendReturnSuccessPipelineSteps(fromAsset, toAsset);
          const result = await simulateTradeSuilendReturn(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(formatSimulationError(result.error ?? "链上模拟失败"));
            setPipelineSteps(markRouteError(successSteps, 2));
            return;
          }

          setPipelineSteps(successSteps);
          setStatus("success");
          return;
        }

        if (route === "suilend_navi") {
          const successSteps = buildSuilendNaviSwapSuccessPipelineSteps(fromAsset, toAsset);
          const result = await simulateTradeSuilendNavi(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(formatSimulationError(result.error ?? "链上模拟失败"));
            setPipelineSteps(markRouteError(successSteps, 2));
            return;
          }

          setPipelineSteps(successSteps);
          setStatus("success");
          return;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "模拟失败";
        setStatus("error");
        setError(formatSimulationError(message));
        setPipelineSteps(
          buildIdlePipelineSteps().map((step, index) =>
            index === 0 ? { ...step, status: "error" } : step,
          ),
        );
      }
    },
    [account?.address, repository],
  );

  return {
    status,
    error,
    quote,
    pipelineSteps,
    reset,
    refreshQuote,
    simulate,
  };
}
