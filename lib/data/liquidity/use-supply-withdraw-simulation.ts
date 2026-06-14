"use client";

import { useCallback, useState } from "react";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { parseAmountToBaseUnits } from "@deepflow/sdk/amount/parse-base-units";
import {
  simulateSupplyThenWithdraw,
  simulateSupplyWithdraw,
  type SupplyWithdrawOperation,
} from "@deepflow/sdk/supply-withdraw";
import type { LiquidityPositionDisplay } from "./liquidity-formatters";
import { notifyLiquidityPositionsChanged } from "./liquidity-data-events";
import { resolveLiquidityWriteMode } from "./resolve-liquidity-write-mode";

export type SimulationStatus =
  | "idle"
  | "simulating"
  | "success"
  | "executing"
  | "executed"
  | "error";

type UseSupplyWithdrawSimulationOptions = {
  onExecuted?: () => void;
};

export function useSupplyWithdrawSimulation(
  operation: SupplyWithdrawOperation,
  options?: UseSupplyWithdrawSimulationOptions,
) {
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const writeMode = resolveLiquidityWriteMode();
  const [status, setStatus] = useState<SimulationStatus>("idle");
  const [error, setError] = useState<string | undefined>();
  const [txDigest, setTxDigest] = useState<string | undefined>();

  const reset = useCallback(() => {
    setStatus("idle");
    setError(undefined);
    setTxDigest(undefined);
  }, []);

  const simulate = useCallback(
    async (params: { position: LiquidityPositionDisplay; amount: string }) => {
      const { position, amount } = params;

      if (!account?.address) {
        setStatus("error");
        setError("请先连接钱包");
        return;
      }

      let baseUnits: bigint;
      try {
        baseUnits = parseAmountToBaseUnits(amount, position.decimals);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Invalid amount");
        return;
      }

      if (operation === "supply" && baseUnits > position.walletCoinBalance) {
        setStatus("error");
        setError(`钱包 ${position.asset} 余额不足，请先转入`);
        return;
      }

      const useWithdrawBootstrap =
        operation === "withdraw" && baseUnits > position.suppliedBalance;

      if (useWithdrawBootstrap && baseUnits > position.walletCoinBalance) {
        setStatus("error");
        setError(
          `钱包 ${position.asset} 余额不足（含 gas 预留），无法 bootstrap supply→withdraw 模拟`,
        );
        return;
      }

      const canExecuteOnChain =
        writeMode === "execute" && operation === "supply" && !useWithdrawBootstrap;

      setStatus("simulating");
      setError(undefined);
      setTxDigest(undefined);

      try {
        const asset = position.coinType || position.asset;
        const protocol =
          position.protocolId === "suilend" ? ("suilend" as const) : ("navi" as const);
        const result = useWithdrawBootstrap
          ? await simulateSupplyThenWithdraw({
              protocol,
              sender: account.address,
              asset,
              assetSymbol: position.asset,
              supplyAmount: baseUnits,
              withdrawAmount: baseUnits,
            })
          : await simulateSupplyWithdraw({
              protocol,
              sender: account.address,
              asset,
              assetSymbol: position.asset,
              amount: baseUnits,
              operation,
            });

        if (!result.ok) {
          setStatus("error");
          setError(result.error ?? "Simulation failed");
          return;
        }

        if (!canExecuteOnChain) {
          setStatus("success");
          setError(undefined);
          return;
        }

        setStatus("executing");

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
        options?.onExecuted?.();
        notifyLiquidityPositionsChanged();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Simulation failed");
      }
    },
    [account?.address, dAppKit, operation, options?.onExecuted, writeMode],
  );

  const isBusy = status === "simulating" || status === "executing";

  return {
    status,
    error,
    txDigest,
    writeMode,
    isSimulating: isBusy,
    simulate,
    reset,
    isWalletConnected: Boolean(account?.address),
  };
}
