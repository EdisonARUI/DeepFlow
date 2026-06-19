"use client";

import { useCallback, useMemo, useState } from "react";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { parseAmountToBaseUnits } from "@deepflow/sdk/amount/parse-base-units";
import { truncateHumanAmountDecimals } from "@deepflow/sdk/amount/truncate-human-amount-decimals";
import {
  alignBaseUnitsToLot,
  buildLimitOrderSuccessPipelineSteps,
  resolveLimitOrderAssets,
  resolveLimitOrderDepositAmount,
  resolveLimitOrderQuantityBounds,
  resolveTickAlignedLimitPrice,
  simulateLimitOrder,
  validateLimitOrderQuantity,
  type LimitOrderSide,
  type PipelineStep,
} from "@deepflow/sdk/trade";
import { notifyLiquidityPositionsChanged } from "@/lib/data/liquidity/liquidity-data-events";
import {
  formatLimitOrderExecutionNote,
  resolveLimitOrderExecutionOutcome,
} from "./resolve-limit-order-execution-outcome";
import { createTradingRepository } from "./create-trading-repository";
import {
  assertSupportedTradePool,
  findPositionForLocation,
  resolveBalanceForLocation,
} from "./resolve-trade-execution";
import { resolveTradingWriteMode } from "./resolve-trading-write-mode";
import type { LimitOrderQuoteView, TradeFundLocation, TradingMarketView } from "./types";

export type LimitOrderSimulationStatus =
  | "idle"
  | "simulating"
  | "success"
  | "executing"
  | "executed"
  | "error";

const WALLET_GAS_RESERVE = 500_000_000n;

type SimulateLimitOrderParams = {
  market: TradingMarketView;
  side: LimitOrderSide;
  price: string;
  quantity: string;
  quantityDecimals: number;
  fundSource: TradeFundLocation;
  payBalance: bigint;
  expireAtMs?: number;
};

type UseLimitOrderSimulationOptions = {
  onExecuted?: () => void;
};

function humanAmountFromBaseUnits(baseUnits: bigint, decimals: number): number {
  return Number(baseUnits) / 10 ** decimals;
}

function formatLimitOrderError(message: string): string {
  if (message.includes("Order quantity must be at least")) {
    return message;
  }
  if (message.includes("Order quantity must be a multiple of")) {
    return message;
  }
  if (
    message.includes("order_info::validate_inputs") &&
    (message.includes('"abortCode":"1"') || message.includes("abort code: 1"))
  ) {
    return "Order quantity is below the pool minimum size. Increase the base quantity and try again.";
  }
  if (
    message.includes("order_info::validate_inputs") &&
    (message.includes('"abortCode":"2"') || message.includes("abort code: 2"))
  ) {
    return "Order quantity must align with the pool lot size. Adjust the base quantity and try again.";
  }
  if (
    message.includes("order_info::validate_inputs") &&
    (message.includes('"abortCode":"0"') || message.includes("abort code: 0"))
  ) {
    return "Limit price is invalid or not aligned to the pool tick size. Adjust the rate and try again.";
  }
  return message;
}

export function useLimitOrderSimulation(options?: UseLimitOrderSimulationOptions) {
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const writeMode = resolveTradingWriteMode();
  const repository = useMemo(() => createTradingRepository(), []);
  const [status, setStatus] = useState<LimitOrderSimulationStatus>("idle");
  const [error, setError] = useState<string | undefined>();
  const [txDigest, setTxDigest] = useState<string | undefined>();
  const [executionNote, setExecutionNote] = useState<string | undefined>();
  const [quote, setQuote] = useState<LimitOrderQuoteView | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(
    buildLimitOrderSuccessPipelineSteps("SUI", "SELL").map((step) => ({
      ...step,
      status: "pending" as const,
    })),
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(undefined);
    setTxDigest(undefined);
    setExecutionNote(undefined);
    setQuote(null);
    setPipelineSteps(
      buildLimitOrderSuccessPipelineSteps("SUI", "SELL").map((step) => ({
        ...step,
        status: "pending" as const,
      })),
    );
  }, []);

  const refreshQuote = useCallback(
    async (
      params: Pick<
        SimulateLimitOrderParams,
        "market" | "side" | "price" | "quantity" | "quantityDecimals"
      >,
    ) => {
      const price = parseFloat(params.price) || 0;
      let quantityHuman = 0;
      try {
        const normalizedQuantity = truncateHumanAmountDecimals(
          params.quantity,
          params.quantityDecimals,
        );
        let quantityBaseUnits = parseAmountToBaseUnits(
          normalizedQuantity,
          params.quantityDecimals,
        );
        try {
          const bounds = await resolveLimitOrderQuantityBounds(params.market.poolKey);
          quantityBaseUnits = alignBaseUnitsToLot(quantityBaseUnits, bounds.lotBaseUnits);
        } catch {
          // ignore bounds fetch failure
        }
        quantityHuman = humanAmountFromBaseUnits(
          quantityBaseUnits,
          params.quantityDecimals,
        );
      } catch {
        quantityHuman = 0;
      }

      try {
        const nextQuote = await repository.getLimitOrderQuote({
          poolKey: params.market.poolKey,
          side: params.side,
          price,
          quantityHuman,
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
    async (params: SimulateLimitOrderParams) => {
      const { market, side, price: priceInput, quantity, quantityDecimals, fundSource, payBalance, expireAtMs } =
        params;

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

      const price = parseFloat(priceInput);
      if (!Number.isFinite(price) || price <= 0) {
        setStatus("error");
        setError("Please enter a valid limit price");
        return;
      }

      let quantityBaseUnits: bigint;
      try {
        const normalizedQuantity = truncateHumanAmountDecimals(quantity, quantityDecimals);
        quantityBaseUnits = parseAmountToBaseUnits(normalizedQuantity, quantityDecimals);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Invalid quantity");
        return;
      }

      try {
        const bounds = await resolveLimitOrderQuantityBounds(market.poolKey);
        quantityBaseUnits = alignBaseUnitsToLot(quantityBaseUnits, bounds.lotBaseUnits);
      } catch {
        // ignore bounds fetch failure
      }

      if (quantityBaseUnits <= 0n) {
        setStatus("error");
        setError("Please enter a valid quantity");
        return;
      }

      try {
        await validateLimitOrderQuantity({
          poolKey: market.poolKey,
          quantityBaseUnits,
        });
      } catch (err) {
        setStatus("error");
        setError(formatLimitOrderError(err instanceof Error ? err.message : "Invalid quantity"));
        return;
      }

      const { depositAsset } = resolveLimitOrderAssets(market.poolKey, side);

      let requiredDeposit: bigint;
      try {
        const alignedPrice = await resolveTickAlignedLimitPrice(market.poolKey, price);
        const resolved = await resolveLimitOrderDepositAmount({
          poolKey: market.poolKey,
          side,
          price: alignedPrice,
          quantityBaseUnits,
        });
        requiredDeposit = resolved.depositAmount;
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to estimate deposit");
        return;
      }

      if (requiredDeposit > payBalance) {
        const sourceLabel = fundSource === "wallet" ? "WALLET" : fundSource.toUpperCase();
        setStatus("error");
        setError(`Insufficient ${depositAsset} balance in ${sourceLabel}`);
        return;
      }

      if (
        fundSource === "wallet" &&
        depositAsset.toUpperCase() === "SUI" &&
        requiredDeposit + WALLET_GAS_RESERVE > payBalance
      ) {
        setStatus("error");
        setError("Please reserve at least 0.5 SUI for gas");
        return;
      }

      setStatus("simulating");
      setError(undefined);
      setTxDigest(undefined);
      setPipelineSteps(
        buildLimitOrderSuccessPipelineSteps(depositAsset, side).map((step, index) => ({
          ...step,
          status: index === 0 ? ("active" as const) : ("pending" as const),
        })),
      );

      try {
        const quantityHuman = humanAmountFromBaseUnits(quantityBaseUnits, quantityDecimals);
        await repository.getLimitOrderQuote({
          poolKey: market.poolKey,
          side,
          price,
          quantityHuman,
        });

        const result = await simulateLimitOrder({
          sender: account.address,
          poolKey: market.poolKey,
          side,
          price,
          quantityBaseUnits,
          fundSource,
          expireAtMs,
        });

        if (!result.ok) {
          setStatus("error");
          setError(formatLimitOrderError(result.error ?? "On-chain simulation failed"));
          setPipelineSteps(
            buildLimitOrderSuccessPipelineSteps(depositAsset, side).map((step, index) => ({
              ...step,
              status: index === 0 ? "error" : "pending",
            })),
          );
          return;
        }

        setPipelineSteps(buildLimitOrderSuccessPipelineSteps(depositAsset, side));

        if (writeMode === "simulate") {
          setStatus("success");
          setError(undefined);
          return;
        }

        setStatus("executing");
        setTxDigest(undefined);

        const execResult = await dAppKit.signAndExecuteTransaction({
          transaction: result.transaction,
        });

        if (execResult.FailedTransaction) {
          setStatus("error");
          setError(
            formatLimitOrderError(
              execResult.FailedTransaction.status.error?.message ?? "Transaction failed",
            ),
          );
          return;
        }

        setStatus("executed");
        const digest = execResult.Transaction.digest;
        setTxDigest(digest);
        setError(undefined);
        const outcome = await resolveLimitOrderExecutionOutcome(digest);
        setExecutionNote(formatLimitOrderExecutionNote(outcome));
        options?.onExecuted?.();
        notifyLiquidityPositionsChanged();
      } catch (err) {
        const message = formatLimitOrderError(
          err instanceof Error ? err.message : "Simulation failed",
        );
        setStatus("error");
        setError(message);
        setPipelineSteps(
          buildLimitOrderSuccessPipelineSteps(depositAsset, side).map((step, index) => ({
            ...step,
            status: index === 0 ? "error" : "pending",
          })),
        );
      }
    },
    [account?.address, dAppKit, options?.onExecuted, repository, writeMode],
  );

  return {
    status,
    error,
    txDigest,
    executionNote,
    quote,
    pipelineSteps,
    writeMode,
    isBusy: status === "simulating" || status === "executing",
    reset,
    refreshQuote,
    simulate,
  };
}
