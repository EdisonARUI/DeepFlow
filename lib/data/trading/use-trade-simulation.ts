"use client";

import { useCallback, useMemo, useState } from "react";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import type { Transaction } from "@mysten/sui/transactions";
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
import { notifyLiquidityPositionsChanged } from "@/lib/data/liquidity/liquidity-data-events";
import { createTradingRepository } from "./create-trading-repository";
import {
  assertSupportedTradePool,
  assertValidSwapAssets,
  resolveTradeExecutionRoute,
} from "./resolve-trade-execution";
import { resolveTradingWriteMode } from "./resolve-trading-write-mode";
import type { TradeExecutionRoute, TradeFundLocation, TradingMarketView, TradeQuoteView } from "./types";

export type TradeSimulationStatus =
  | "idle"
  | "simulating"
  | "success"
  | "executing"
  | "executed"
  | "error";

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

type SimulationResult = {
  ok: boolean;
  error?: string;
  transaction: Transaction;
};

type UseTradeSimulationOptions = {
  onExecuted?: (digest: string) => void;
};

function humanAmountFromBaseUnits(baseUnits: bigint, decimals: number): number {
  return Number(baseUnits) / 10 ** decimals;
}

function formatSimulationError(message: string): string {
  if (message.includes("minOutput must be positive") || message.includes("minUsdcOut must be positive")) {
    return "Unable to get a valid DeepBook quote. Please try again later or adjust the trade amount.";
  }
  if (message.includes('"abortCode":"1502"') || message.includes("abort code: 1502")) {
    return "Navi on-chain price state is stale. Please retry.";
  }
  if (message.includes("No Suilend obligation found")) {
    return "Please deposit assets into Suilend first, or run Supply from the Liquidity page.";
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

export function useTradeSimulation(options?: UseTradeSimulationOptions) {
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const writeMode = resolveTradingWriteMode();
  const repository = useMemo(() => createTradingRepository(), []);
  const [status, setStatus] = useState<TradeSimulationStatus>("idle");
  const [error, setError] = useState<string | undefined>();
  const [txDigest, setTxDigest] = useState<string | undefined>();
  const [quote, setQuote] = useState<TradeQuoteView | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(
    buildIdlePipelineSteps(),
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(undefined);
    setTxDigest(undefined);
    setPipelineSteps(buildIdlePipelineSteps());
  }, []);

  const finishSimulation = useCallback(
    async (params: {
      result: SimulationResult;
      successSteps: PipelineStep[];
      errorStepIndex: number;
    }) => {
      const { result, successSteps, errorStepIndex } = params;

      if (!result.ok) {
        setStatus("error");
        setError(formatSimulationError(result.error ?? "On-chain simulation failed"));
        setPipelineSteps(markRouteError(successSteps, errorStepIndex));
        return;
      }

      setPipelineSteps(successSteps);

      if (writeMode === "simulate") {
        setStatus("success");
        setError(undefined);
        return;
      }

      setStatus("executing");
      setTxDigest(undefined);

      try {
        const execResult = await dAppKit.signAndExecuteTransaction({
          transaction: result.transaction,
        });

        if (execResult.FailedTransaction) {
          setStatus("error");
          setError(
            execResult.FailedTransaction.status.error?.message ?? "Transaction failed",
          );
          return;
        }

        setStatus("executed");
        setTxDigest(execResult.Transaction.digest);
        setError(undefined);
        options?.onExecuted?.(execResult.Transaction.digest);
        notifyLiquidityPositionsChanged();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Transaction failed");
      }
    },
    [dAppKit, options?.onExecuted, writeMode],
  );

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
        setError("Please connect wallet first");
        return;
      }

      if (writeMode === "execute" && process.env.NEXT_PUBLIC_DATA_SOURCE !== "live") {
        setStatus("error");
        setError("Execute mode requires NEXT_PUBLIC_DATA_SOURCE=live");
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
        setError("Please enter a valid trade amount");
        return;
      }

      const route = resolveTradeExecutionRoute(fundSource, fundDestination);
      if (route === "unsupported") {
        setStatus("error");
        setError("Current SOURCE / DESTINATION combination is not supported yet");
        return;
      }

      if (baseUnits > payBalance) {
        const sourceLabel =
          fundSource === "wallet" ? "WALLET" : fundSource.toUpperCase();
        setStatus("error");
        setError(`Insufficient ${fromAsset} balance in ${sourceLabel}`);
        return;
      }

      if (
        fundSource === "wallet" &&
        fromAsset.toUpperCase() === "SUI" &&
        WALLET_SOURCE_ROUTES.has(route) &&
        baseUnits + WALLET_GAS_RESERVE > payBalance
      ) {
        setStatus("error");
        setError("Please reserve at least 0.5 SUI for gas");
        return;
      }

      setStatus("simulating");
      setError(undefined);
      setTxDigest(undefined);
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
          setError(`Output decimal resolution for ${toAsset} is not supported yet`);
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
          setError("Unable to get a valid DeepBook quote. Please try again later or adjust the trade amount.");
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
          await finishSimulation({
            result: await simulateTradeWalletSwap(swapParams),
            successSteps: buildWalletSwapSuccessPipelineSteps(fromAsset, toAsset),
            errorStepIndex: 0,
          });
          return;
        }

        if (route === "wallet_navi") {
          await finishSimulation({
            result: await simulateTradeWalletNavi(swapParams),
            successSteps: buildWalletNaviSwapSuccessPipelineSteps(fromAsset, toAsset),
            errorStepIndex: 0,
          });
          return;
        }

        if (route === "wallet_suilend") {
          await finishSimulation({
            result: await simulateTradeWalletSuilend(swapParams),
            successSteps: buildWalletSuilendSwapSuccessPipelineSteps(fromAsset, toAsset),
            errorStepIndex: 0,
          });
          return;
        }

        if (route === "navi_navi") {
          await finishSimulation({
            result: await simulateTradeNaviRoundTrip(swapParams),
            successSteps: buildNaviRoundTripSuccessPipelineSteps(fromAsset, toAsset),
            errorStepIndex: 2,
          });
          return;
        }

        if (route === "navi_wallet") {
          await finishSimulation({
            result: await simulateTradeNaviReturn(swapParams),
            successSteps: buildNaviReturnSuccessPipelineSteps(fromAsset, toAsset),
            errorStepIndex: 2,
          });
          return;
        }

        if (route === "navi_suilend") {
          await finishSimulation({
            result: await simulateTradeNaviSuilend(swapParams),
            successSteps: buildNaviSuilendSwapSuccessPipelineSteps(fromAsset, toAsset),
            errorStepIndex: 2,
          });
          return;
        }

        if (route === "suilend_suilend") {
          await finishSimulation({
            result: await simulateTradeSuilendRoundTrip(swapParams),
            successSteps: buildSuilendRoundTripSuccessPipelineSteps(fromAsset, toAsset),
            errorStepIndex: 2,
          });
          return;
        }

        if (route === "suilend_wallet") {
          await finishSimulation({
            result: await simulateTradeSuilendReturn(swapParams),
            successSteps: buildSuilendReturnSuccessPipelineSteps(fromAsset, toAsset),
            errorStepIndex: 2,
          });
          return;
        }

        if (route === "suilend_navi") {
          await finishSimulation({
            result: await simulateTradeSuilendNavi(swapParams),
            successSteps: buildSuilendNaviSwapSuccessPipelineSteps(fromAsset, toAsset),
            errorStepIndex: 2,
          });
          return;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Simulation failed";
        setStatus("error");
        setError(formatSimulationError(message));
        setPipelineSteps(
          buildIdlePipelineSteps().map((step, index) =>
            index === 0 ? { ...step, status: "error" } : step,
          ),
        );
      }
    },
    [account?.address, finishSimulation, repository, writeMode],
  );

  const isBusy = status === "simulating" || status === "executing";

  return {
    status,
    error,
    txDigest,
    writeMode,
    quote,
    pipelineSteps,
    isBusy,
    reset,
    refreshQuote,
    simulate,
  };
}
