"use client";

import { useCallback, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { parseAmountToBaseUnits } from "@deepflow/sdk/amount/parse-base-units";
import {
  buildIdlePipelineSteps,
  buildPipelineStepsFromPtb,
  deepbookQuoteFromHuman,
  simulateTrade,
} from "@deepflow/sdk/trade";
import type { PipelineStep } from "@deepflow/sdk/trade";
import type { CreditSource, ExecutionIntent } from "@deepflow/sdk";
import { createTradingRepository } from "./create-trading-repository";
import {
  createDemoTradingPolicy,
  creditSourceFromLiquidityPosition,
} from "./trading-policy";
import type { TradingMarketView, TradeQuoteView } from "./types";

export type TradeSimulationStatus = "idle" | "simulating" | "success" | "error";

type SimulateParams = {
  market: TradingMarketView;
  fromAmount: string;
  isReversed: boolean;
  creditPosition?: {
    asset: string;
    suppliedBalance: bigint;
    protocol: string;
    decimals: number;
  };
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
    async (params: SimulateParams) => {
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
      const { market, fromAmount, isReversed, creditPosition } = params;

      if (!account?.address) {
        setStatus("error");
        setError("请先连接钱包");
        return;
      }

      if (!creditPosition) {
        setStatus("error");
        setError("未找到匹配的 DeFi credit source 余额");
        return;
      }

      let baseUnits: bigint;
      try {
        baseUnits = parseAmountToBaseUnits(fromAmount, creditPosition.decimals);
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

      if (baseUnits > creditPosition.suppliedBalance) {
        setStatus("error");
        setError(`DeFi 内 ${creditPosition.asset} supply 余额不足`);
        return;
      }

      setStatus("simulating");
      setError(undefined);
      setPipelineSteps(buildIdlePipelineSteps().map((s, i) => (i === 0 ? { ...s, status: "active" } : s)));

      try {
        const isSellBase = !isReversed;
        const fromAsset = isSellBase ? market.baseAsset : market.quoteAsset;
        const toAsset = isSellBase ? market.quoteAsset : market.baseAsset;
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

        const creditSource: CreditSource = creditSourceFromLiquidityPosition(creditPosition);
        const policy = createDemoTradingPolicy(account.address);

        const intent: ExecutionIntent = {
          id: `trade-${Date.now()}`,
          market: `DEEPBOOK:${market.poolKey.replace("_", "-")}`,
          side: isSellBase ? "sell" : "buy",
          inputAsset: fromAsset,
          outputAsset: toAsset,
          amount: baseUnits,
          minOutput: deepbookQuote.minOutput,
          maxSlippageBps: slippageBps,
          destination: account.address,
          deadlineMs: Date.now() + 120_000,
          creditSourceId: creditSource.id,
          settlementMode: "redeposit",
        };

        setPipelineSteps(
          buildIdlePipelineSteps().map((step, index) =>
            index === 0 ? { ...step, status: "done" } : index === 1 ? { ...step, status: "active" } : step,
          ),
        );

        const result = simulateTrade({
          intent,
          policy,
          creditSources: [creditSource],
          deepbookQuote,
        });

        if (result.status === "rejected") {
          setStatus("error");
          setError(result.issues?.[0]?.message ?? "策略校验未通过");
          setPipelineSteps(result.pipelineSteps);
          return;
        }

        if (result.ptb) {
          setPipelineSteps(buildPipelineStepsFromPtb(result.ptb, "success"));
        }

        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "模拟失败");
        setPipelineSteps(
          buildIdlePipelineSteps().map((step, index) =>
            index === 3 ? { ...step, status: "error" } : { ...step, status: index < 3 ? "done" : step.status },
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
