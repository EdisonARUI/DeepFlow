"use client";

import { useCallback, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { parseAmountToBaseUnits } from "@deepflow/sdk/amount/parse-base-units";
import {
  simulateSupplyWithdraw,
  type SupplyWithdrawOperation,
} from "@deepflow/sdk/supply-withdraw";
import type { LiquidityPositionDisplay } from "./liquidity-formatters";

export type SimulationStatus = "idle" | "simulating" | "success" | "error";

export function useSupplyWithdrawSimulation(operation: SupplyWithdrawOperation) {
  const account = useCurrentAccount();
  const [status, setStatus] = useState<SimulationStatus>("idle");
  const [error, setError] = useState<string | undefined>();

  const reset = useCallback(() => {
    setStatus("idle");
    setError(undefined);
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

      if (operation === "withdraw" && baseUnits > position.suppliedBalance) {
        setStatus("error");
        setError(`协议内 ${position.asset} supply 余额不足`);
        return;
      }

      setStatus("simulating");
      setError(undefined);

      try {
        const result = await simulateSupplyWithdraw({
          sender: account.address,
          asset: position.coinType || position.asset,
          assetSymbol: position.asset,
          amount: baseUnits,
          operation,
        });

        if (result.ok) {
          setStatus("success");
          setError(undefined);
          return;
        }

        setStatus("error");
        setError(result.error ?? "Simulation failed");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Simulation failed");
      }
    },
    [account?.address, operation],
  );

  return {
    status,
    error,
    isSimulating: status === "simulating",
    simulate,
    reset,
    isWalletConnected: Boolean(account?.address),
  };
}
