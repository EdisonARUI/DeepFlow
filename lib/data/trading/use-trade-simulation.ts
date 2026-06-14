"use client";

import { useCallback, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { parseAmountToBaseUnits } from "@deepflow/sdk/amount/parse-base-units";
import {
  buildBootstrapSuccessPipelineSteps,
  buildIdlePipelineSteps,
  buildNaviReturnSuccessPipelineSteps,
  buildNaviRoundTripSuccessPipelineSteps,
  buildWalletSwapSuccessPipelineSteps,
  deepbookQuoteFromHuman,
  simulateTradeBootstrap,
  simulateTradeNaviReturn,
  simulateTradeNaviRoundTrip,
  simulateTradeWalletSwap,
} from "@deepflow/sdk/trade";
import type { PipelineStep } from "@deepflow/sdk/trade";
import { createTradingRepository } from "./create-trading-repository";
import {
  assertSupportedTradePool,
  isSuilendInvolved,
  resolveTradeExecutionRoute,
} from "./resolve-trade-execution";
import type { TradeFundLocation, TradingMarketView, TradeQuoteView } from "./types";

export type TradeSimulationStatus = "idle" | "simulating" | "success" | "error";

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
    async (params: Pick<SimulateParams, "market" | "fromAmount" | "isReversed">) => {
      const parsed = parseFloat(params.fromAmount) || 0;
      const isSellBase = !params.isReversed;

      try {
        const nextQuote = await repository.getMarketQuote({
          poolKey: params.market.poolKey,
          inputAmount: parsed,
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

      if (isSuilendInvolved(fundSource, fundDestination)) {
        setStatus("error");
        setError("Suilend 交易路径尚未支持");
        return;
      }

      const poolError = assertSupportedTradePool(market.poolKey);
      if (poolError) {
        setStatus("error");
        setError(poolError);
        return;
      }

      const isSellBase = !isReversed;
      if (!isSellBase || fromAsset.toUpperCase() !== "SUI" || toAsset.toUpperCase() !== "USDC") {
        setStatus("error");
        setError("当前 Execute 模拟仅支持卖出 SUI 换 USDC");
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

      setStatus("simulating");
      setError(undefined);
      setPipelineSteps(
        buildIdlePipelineSteps().map((step, index) =>
          index === 0 ? { ...step, status: "active" } : step,
        ),
      );

      try {
        const liveQuote = await repository.getMarketQuote({
          poolKey: market.poolKey,
          inputAmount: parseFloat(fromAmount) || 0,
          isSellBase,
        });
        setQuote(liveQuote);

        const slippageBps = 50;
        const minOutputHuman =
          liveQuote.estimatedOutput * (1 - slippageBps / 10_000);

        const deepbookQuote = deepbookQuoteFromHuman({
          estimatedOutput: liveQuote.estimatedOutput,
          minOutput: minOutputHuman,
          deepRequired: liveQuote.deepRequired,
          feeLabel: liveQuote.feeLabel,
          slippageBps,
          outputDecimals: 6,
        });

        const swapParams = {
          sender: account.address,
          suiAmount: baseUnits,
          minUsdcOut: deepbookQuote.minOutput,
          deepAmount: liveQuote.deepRequired,
          deepbookPoolKey: market.poolKey,
        };

        if (route === "wallet_wallet") {
          const result = await simulateTradeWalletSwap(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(result.error ?? "链上模拟失败");
            setPipelineSteps(
              buildWalletSwapSuccessPipelineSteps().map((step, index) =>
                index === 0 ? { ...step, status: "error" } : step,
              ),
            );
            return;
          }

          setPipelineSteps(buildWalletSwapSuccessPipelineSteps());
          setStatus("success");
          return;
        }

        if (route === "wallet_navi") {
          const result = await simulateTradeBootstrap(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(result.error ?? "链上模拟失败");
            setPipelineSteps(
              buildBootstrapSuccessPipelineSteps().map((step, index) =>
                index === 3 ? { ...step, status: "error" } : { ...step, status: index < 3 ? "done" : step.status },
              ),
            );
            return;
          }

          setPipelineSteps(buildBootstrapSuccessPipelineSteps());
          setStatus("success");
          return;
        }

        if (route === "navi_navi") {
          const result = await simulateTradeNaviRoundTrip(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(result.error ?? "链上模拟失败");
            setPipelineSteps(
              buildNaviRoundTripSuccessPipelineSteps().map((step, index) =>
                index === 2 ? { ...step, status: "error" } : { ...step, status: index < 2 ? "done" : step.status },
              ),
            );
            return;
          }

          setPipelineSteps(buildNaviRoundTripSuccessPipelineSteps());
          setStatus("success");
          return;
        }

        if (route === "navi_wallet") {
          const result = await simulateTradeNaviReturn(swapParams);

          if (!result.ok) {
            setStatus("error");
            setError(result.error ?? "链上模拟失败");
            setPipelineSteps(
              buildNaviReturnSuccessPipelineSteps().map((step, index) =>
                index === 2 ? { ...step, status: "error" } : { ...step, status: index < 2 ? "done" : step.status },
              ),
            );
            return;
          }

          setPipelineSteps(buildNaviReturnSuccessPipelineSteps());
          setStatus("success");
          return;
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "模拟失败");
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
