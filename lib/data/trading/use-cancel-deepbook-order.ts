"use client";

import { useCallback, useState } from "react";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import {
  buildCancelOrderSuccessPipelineSteps,
  simulateCancelAllDeepbookOrders,
  simulateCancelDeepbookOrder,
  type PipelineStep,
} from "@deepflow/sdk/trade";
import { resolveTradingWriteMode } from "./resolve-trading-write-mode";

export type CancelOrderStatus =
  | "idle"
  | "simulating"
  | "executing"
  | "executed"
  | "error";

type CancelOrderParams = {
  poolKey: string;
  managerId: string;
  orderId: string;
};

type CancelAllParams = {
  poolKey: string;
  managerId: string;
};

type CancelAllForPoolsParams = {
  poolKeys: string[];
  managerId: string;
};

type UseCancelDeepbookOrderOptions = {
  onExecuted?: () => void;
};

export function useCancelDeepbookOrder(options?: UseCancelDeepbookOrderOptions) {
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const writeMode = resolveTradingWriteMode();
  const [status, setStatus] = useState<CancelOrderStatus>("idle");
  const [error, setError] = useState<string | undefined>();
  const [txDigest, setTxDigest] = useState<string | undefined>();
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(
    buildCancelOrderSuccessPipelineSteps().map((step) => ({ ...step, status: "pending" })),
  );

  const finish = useCallback(
    async (params: {
      ok: boolean;
      transaction: Awaited<ReturnType<typeof simulateCancelDeepbookOrder>>["transaction"];
      errorMessage?: string;
    }) => {
      if (!params.ok) {
        setStatus("error");
        setError(params.errorMessage ?? "Cancel simulation failed");
        setPipelineSteps(
          buildCancelOrderSuccessPipelineSteps().map((step) => ({
            ...step,
            status: "error",
          })),
        );
        return;
      }

      setPipelineSteps(buildCancelOrderSuccessPipelineSteps());

      if (writeMode === "simulate") {
        setStatus("executed");
        setError(undefined);
        options?.onExecuted?.();
        return;
      }

      setStatus("executing");
      setTxDigest(undefined);

      try {
        const execResult = await dAppKit.signAndExecuteTransaction({
          transaction: params.transaction,
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
        options?.onExecuted?.();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Transaction failed");
      }
    },
    [dAppKit, options?.onExecuted, writeMode],
  );

  const cancelOrder = useCallback(
    async (params: CancelOrderParams) => {
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

      setStatus("simulating");
      setError(undefined);
      setTxDigest(undefined);

      try {
        const result = await simulateCancelDeepbookOrder({
          sender: account.address,
          poolKey: params.poolKey,
          managerId: params.managerId,
          orderId: params.orderId,
        });

        await finish({
          ok: result.ok,
          transaction: result.transaction,
          errorMessage: result.error,
        });
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Cancel failed");
      }
    },
    [account?.address, finish, writeMode],
  );

  const cancelAllOrders = useCallback(
    async (params: CancelAllParams) => {
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

      setStatus("simulating");
      setError(undefined);
      setTxDigest(undefined);

      try {
        const result = await simulateCancelAllDeepbookOrders({
          sender: account.address,
          poolKey: params.poolKey,
          managerId: params.managerId,
        });

        await finish({
          ok: result.ok,
          transaction: result.transaction,
          errorMessage: result.error,
        });
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Cancel all failed");
      }
    },
    [account?.address, finish, writeMode],
  );

  const cancelAllOrdersForPools = useCallback(
    async (params: CancelAllForPoolsParams) => {
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

      const uniquePoolKeys = [...new Set(params.poolKeys)];
      if (uniquePoolKeys.length === 0) return;

      setStatus("simulating");
      setError(undefined);
      setTxDigest(undefined);

      try {
        for (const poolKey of uniquePoolKeys) {
          const result = await simulateCancelAllDeepbookOrders({
            sender: account.address,
            poolKey,
            managerId: params.managerId,
          });

          if (!result.ok) {
            setStatus("error");
            setError(result.error ?? `Cancel all failed for ${poolKey}`);
            return;
          }

          if (writeMode === "simulate") {
            continue;
          }

          setStatus("executing");
          const execResult = await dAppKit.signAndExecuteTransaction({
            transaction: result.transaction,
          });

          if (execResult.FailedTransaction) {
            setStatus("error");
            setError(
              execResult.FailedTransaction.status.error?.message ??
                `Transaction failed for ${poolKey}`,
            );
            return;
          }

          setTxDigest(execResult.Transaction.digest);
        }

        setPipelineSteps(buildCancelOrderSuccessPipelineSteps());
        setStatus("executed");
        setError(undefined);
        options?.onExecuted?.();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Cancel all failed");
      }
    },
    [account?.address, dAppKit, options?.onExecuted, writeMode],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(undefined);
    setTxDigest(undefined);
    setPipelineSteps(
      buildCancelOrderSuccessPipelineSteps().map((step) => ({ ...step, status: "pending" })),
    );
  }, []);

  return {
    status,
    error,
    txDigest,
    pipelineSteps,
    isBusy: status === "simulating" || status === "executing",
    cancelOrder,
    cancelAllOrders,
    cancelAllOrdersForPools,
    reset,
  };
}
